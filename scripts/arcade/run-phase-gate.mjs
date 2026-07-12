import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const phase = process.argv[2];

if (!phase || !/^\d+\.5$/.test(phase)) {
  console.error("Usage: node scripts/arcade/run-phase-gate.mjs <X.5>");
  process.exit(2);
}

const startedAt = new Date();
const reportRoot = resolve(repositoryRoot, `test-results/arcade/phase-${phase}`);
mkdirSync(resolve(reportRoot, "junit"), { recursive: true });

const environment = {
  ...process.env,
  ARCADE_PHASE: phase
};

const commands = [
  { name: "Jekyll production build", command: "npm", args: ["run", "build:site"] },
  ...(Number(phase) >= 1.5 ? [{ name: "Arcade registry validation", command: "npm", args: ["run", "validate:arcade"] }] : []),
  { name: "Unit, contract, and integration tests", command: "npm", args: ["run", "test:unit"] },
  { name: "Browser, accessibility, and visual tests", command: "npm", args: ["run", "test:browser"] }
];

const commandResults = [];

for (const entry of commands) {
  console.log(`\n[phase ${phase}] ${entry.name}`);
  const result = spawnSync(entry.command, entry.args, {
    cwd: repositoryRoot,
    env: environment,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  process.stdout.write(output);
  const slug = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  writeFileSync(resolve(reportRoot, `${slug}.log`), output);
  commandResults.push({
    name: entry.name,
    command: [entry.command, ...entry.args].join(" "),
    exitCode: result.status ?? 1,
    signal: result.signal || null
  });

  if ((result.status ?? 1) !== 0) {
    break;
  }
}

function readJson(path) {
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectPlaywrightSpecs(suites, identities = new Map()) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      const identity = [spec.file || suite.file || "", spec.line || 0, spec.column || 0, spec.title].join(":");
      const record = identities.get(identity) || {
        identity,
        file: spec.file || suite.file || "",
        title: spec.title,
        executions: []
      };
      for (const test of spec.tests || []) {
        record.executions.push({
          project: test.projectName || test.projectId || "unknown",
          status: test.status,
          expectedStatus: test.expectedStatus,
          results: (test.results || []).map((result) => ({
            status: result.status,
            retry: result.retry,
            durationMs: result.duration,
            attachments: (result.attachments || []).map((attachment) => ({
              name: attachment.name,
              contentType: attachment.contentType,
              path: attachment.path || null
            }))
          }))
        });
      }
      identities.set(identity, record);
    }
    collectPlaywrightSpecs(suite.suites, identities);
  }
  return identities;
}

const matrixPath = resolve(repositoryRoot, `tests/arcade/fixtures/phase-${phase}-matrix.yml`);
const matrix = existsSync(matrixPath) ? YAML.parse(readFileSync(matrixPath, "utf8")) : {};
const minimumDistinctChecks = matrix?.target?.minimum ?? 0;
const plannedDistinctChecks = matrix?.target?.planned ?? matrix?.total ?? 0;
const retainedDistinctChecks = matrix?.full_regression?.retained_distinct_checks ?? 0;
const vitest = readJson(resolve(reportRoot, "vitest-results.json"));
const playwright = readJson(resolve(reportRoot, "playwright-results.json"));
const playwrightSpecs = collectPlaywrightSpecs(playwright?.suites);

const unit = {
  total: vitest?.numTotalTests ?? 0,
  passed: vitest?.numPassedTests ?? 0,
  failed: vitest?.numFailedTests ?? 0,
  skipped: vitest?.numPendingTests ?? 0
};
const browser = {
  distinctSpecs: playwrightSpecs.size,
  expected: playwright?.stats?.expected ?? 0,
  unexpected: playwright?.stats?.unexpected ?? 0,
  flaky: playwright?.stats?.flaky ?? 0,
  skipped: playwright?.stats?.skipped ?? 0,
  durationMs: playwright?.stats?.duration ?? 0
};
const actualDistinctChecks = unit.total + browser.distinctSpecs;
const actualNewChecks = Math.max(0, actualDistinctChecks - retainedDistinctChecks);
const generatedModelRunMinimum = matrix?.generated_model_runs_minimum ?? 0;
const generatedModelRunAssertion = (vitest?.testResults || [])
  .flatMap((result) => result.assertionResults || [])
  .find((assertion) => assertion.title?.startsWith("P2-UNIT-064 "));
const generatedModelRuns = generatedModelRunAssertion?.status === "passed"
  ? generatedModelRunMinimum
  : 0;

const priorPassingGates = existsSync(resolve(repositoryRoot, "test-results/arcade"))
  ? readdirSync(resolve(repositoryRoot, "test-results/arcade"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^phase-\d+\.5$/.test(entry.name) && entry.name !== `phase-${phase}`)
    .map((entry) => readJson(resolve(repositoryRoot, "test-results/arcade", entry.name, "summary.json")))
    .filter((summary) => summary?.status === "passed")
    .map((summary) => summary.phase)
    .sort((left, right) => Number(left) - Number(right))
  : [];

const allCommandsPassed = commandResults.length === commands.length && commandResults.every((entry) => entry.exitCode === 0);
const countsPassed = actualNewChecks >= minimumDistinctChecks &&
  actualDistinctChecks >= retainedDistinctChecks + minimumDistinctChecks;
const generatedRunsPassed = generatedModelRuns >= generatedModelRunMinimum;
const noSkippedOrFailedTests = unit.failed === 0 && unit.skipped === 0 && browser.unexpected === 0 && browser.skipped === 0;
const passed = allCommandsPassed && countsPassed && generatedRunsPassed && noSkippedOrFailedTests;
const endedAt = new Date();

function vitestCategory(path) {
  if (path.includes("phase2-rng-clock") || path.includes("phase2-outrefresh-model")) return "phase2_deterministic_model";
  if (path.includes("phase2-action-replay-save") || path.includes("phase2-host-persistence")) return "phase2_replay_persistence_lifecycle";
  if (path.includes("phase2-runtime-page")) return "phase2_jekyll_runtime_integration";
  if (path.includes("phase1-registry")) return "phase1_registry_schema";
  if (path.includes("phase1-jekyll-routes")) return "phase1_jekyll_routes";
  if (path.includes("/contracts/")) return "gate0_source_contracts";
  if (path.includes("jekyll-build")) return "gate0_jekyll_integration";
  return "other_unit";
}

function browserCategory(title) {
  if (title.startsWith("P2-E2E-")) return "phase2_browser_gameplay_accessibility_visual";
  if (title.startsWith("P1-CAT-")) return "phase1_browser_catalog";
  if (title.startsWith("E2E-")) return "gate0_browser_gameplay";
  if (title.startsWith("AV-")) return "gate0_accessibility_visual_lifecycle";
  return "other_browser";
}

const categories = {};
for (const result of vitest?.testResults || []) {
  const category = vitestCategory(result.name || "");
  const bucket = categories[category] || { distinct: 0, passed: 0, failed: 0, skipped: 0 };
  for (const assertion of result.assertionResults || []) {
    bucket.distinct += 1;
    if (assertion.status === "passed") bucket.passed += 1;
    else if (assertion.status === "failed") bucket.failed += 1;
    else bucket.skipped += 1;
  }
  categories[category] = bucket;
}

const screenshotEvidence = [];
for (const spec of playwrightSpecs.values()) {
  const category = browserCategory(spec.title);
  const bucket = categories[category] || { distinct: 0, executions: 0, passed: 0, failed: 0, skipped: 0 };
  bucket.distinct += 1;
  for (const execution of spec.executions) {
    bucket.executions += 1;
    if (execution.status === "expected") bucket.passed += 1;
    else if (execution.status === "skipped") bucket.skipped += 1;
    else bucket.failed += 1;
    for (const result of execution.results) {
      for (const attachment of result.attachments) {
        if (attachment.contentType === "image/png") {
          screenshotEvidence.push({ spec: spec.title, project: execution.project, ...attachment });
        }
      }
    }
  }
  categories[category] = bucket;
}

const registry = existsSync(resolve(repositoryRoot, "_data/arcade_games.yml"))
  ? YAML.parse(readFileSync(resolve(repositoryRoot, "_data/arcade_games.yml"), "utf8"))
  : [];
const gitCommit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).stdout?.trim() || null;
const gitDirty = Boolean(spawnSync("git", ["status", "--porcelain"], { cwd: repositoryRoot, encoding: "utf8" }).stdout?.trim());
const builtHomepage = existsSync(resolve(repositoryRoot, "_site/index.html"))
  ? readFileSync(resolve(repositoryRoot, "_site/index.html"), "utf8")
  : "";
const buildRevision = builtHomepage.match(/\?v=([a-f0-9]{7,40})/)?.[1] || null;

const summary = {
  schemaVersion: 1,
  phase,
  status: passed ? "passed" : "failed",
  model: process.env.CODEX_MODEL || "GPT-5 (Codex)",
  startedAt: startedAt.toISOString(),
  endedAt: endedAt.toISOString(),
  durationMs: endedAt.getTime() - startedAt.getTime(),
  target: {
    minimumNewDistinctChecks: minimumDistinctChecks,
    plannedNewDistinctChecks: plannedDistinctChecks,
    retainedDistinctChecks,
    plannedTotalDistinctChecks: retainedDistinctChecks + plannedDistinctChecks
  },
  actual: {
    distinctChecks: actualDistinctChecks,
    newDistinctChecks: actualNewChecks,
    generatedModelRuns,
    unit,
    browser,
    categories
  },
  versions: {
    registrySchemaVersions: [...new Set(registry.map((game) => game.schema_version))],
    gameVersions: [...new Set(registry.map((game) => game.release?.game_version).filter(Boolean))],
    rulesVersions: [...new Set(registry.map((game) => game.release?.rules_version).filter(Boolean))],
    seedVersions: [...new Set(registry.map((game) => game.release?.seed_version).filter(Boolean))],
    saveSchemaVersions: [...new Set(registry.map((game) => game.release?.save_schema_version).filter(Boolean))]
  },
  environment: {
    node: process.version,
    browserProjects: (playwright?.config?.projects || []).map((project) => project.name || project.id),
    gitCommit,
    gitDirty,
    jekyllBuildRevision: buildRevision
  },
  cumulativeRegression: {
    priorPassingGates,
    expectedPriorGates: matrix?.full_regression?.prior_gates ?? [],
    retainedDistinctChecks,
    included: retainedDistinctChecks === 0 ? "No earlier gate exists; this is the baseline." : "All retained tests from prior gates were run in the cumulative suite."
  },
  commands: commandResults
};

writeFileSync(resolve(reportRoot, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

for (const directory of ["browser", "screenshots", "accessibility", "performance"]) {
  mkdirSync(resolve(reportRoot, directory), { recursive: true });
}
writeFileSync(resolve(reportRoot, "browser", "summary.json"), `${JSON.stringify({
  projects: summary.environment.browserProjects,
  stats: browser,
  categories: Object.fromEntries(Object.entries(categories).filter(([key]) => key.includes("browser") || key.includes("accessibility")))
}, null, 2)}\n`);
writeFileSync(resolve(reportRoot, "screenshots", "manifest.json"), `${JSON.stringify({ count: screenshotEvidence.length, screenshots: screenshotEvidence }, null, 2)}\n`);
writeFileSync(resolve(reportRoot, "accessibility", "summary.json"), `${JSON.stringify({
  matchingSpecs: [...playwrightSpecs.values()].filter((spec) => /axe|accessible|focus|aria|JavaScript-disabled|WCAG/i.test(spec.title)).map((spec) => spec.title)
}, null, 2)}\n`);
writeFileSync(resolve(reportRoot, "performance", "summary.json"), `${JSON.stringify({
  matchingSpecs: [...playwrightSpecs.values()].filter((spec) => /request|asset|overflow|geometry|DPR|lifecycle/i.test(spec.title)).map((spec) => spec.title)
}, null, 2)}\n`);

const markdown = `# Cryptography Arcade Phase ${phase} gate\n\n` +
  `- Status: **${passed ? "PASSED" : "FAILED"}**\n` +
  `- Model: ${summary.model}\n` +
  `- Started: ${summary.startedAt}\n` +
  `- Ended: ${summary.endedAt}\n` +
  `- New distinct checks: ${actualNewChecks} (minimum ${minimumDistinctChecks}; planned ${plannedDistinctChecks})\n` +
  `- Total cumulative distinct checks: ${actualDistinctChecks} (${retainedDistinctChecks} retained baseline checks expected)\n` +
  `- Unit/contract/integration: ${unit.passed}/${unit.total} passed; ${unit.failed} failed; ${unit.skipped} skipped\n` +
  `- Browser executions: ${browser.expected} expected; ${browser.unexpected} unexpected; ${browser.flaky} flaky; ${browser.skipped} skipped across ${browser.distinctSpecs} distinct specs\n` +
  (generatedModelRunMinimum > 0 ? `- Generated model runs: ${generatedModelRuns}/${generatedModelRunMinimum}\n` : "") +
  `- Cumulative regression: ${summary.cumulativeRegression.included}\n\n` +
  `## Commands\n\n` +
  commandResults.map((entry) => `- \`${entry.command}\`: exit ${entry.exitCode}`).join("\n") + "\n";

writeFileSync(resolve(reportRoot, "summary.md"), markdown);
console.log(`\n${markdown}`);
process.exit(passed ? 0 : 1);
