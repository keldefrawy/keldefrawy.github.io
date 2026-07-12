import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");

function read(path) {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function fail(message) {
  throw new Error(message);
}

function unique(values, label) {
  const duplicate = values.find((value, index) => values.indexOf(value) !== index);
  if (duplicate !== undefined) fail(`Duplicate ${label}: ${duplicate}`);
}

const games = YAML.parse(read("_data/arcade_games.yml"));
const publications = YAML.parse(read("_data/publications.yml"));
const schema = JSON.parse(read("schemas/arcade-game.schema.json"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

if (!validate(games)) {
  fail(`Arcade registry schema failed:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

if (games.length !== 36) fail(`Expected 36 Arcade records, received ${games.length}`);
unique(games.map((game) => game.catalog_id), "catalog ID");
unique(games.map((game) => game.id), "game ID");
unique(games.map((game) => game.slug), "slug");

const expectedCatalogIds = [
  ...Array.from({ length: 20 }, (_, index) => `R${String(index).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `C${String(index + 1).padStart(2, "0")}`)
];
const actualCatalogIds = games.map((game) => game.catalog_id).sort();
if (JSON.stringify(actualCatalogIds) !== JSON.stringify(expectedCatalogIds.sort())) {
  fail("Registry must contain every planning ID R00-R19 and C01-C16 exactly once");
}

const publicationIds = new Set(publications.map((publication) => publication.id));
let paperReferenceCount = 0;
let implementedModuleCount = 0;
let reservedModuleCount = 0;

for (const game of games) {
  if (game.id !== game.slug) fail(`${game.catalog_id}: id and slug must match in Phase 1`);
  if (game.session_minutes[0] >= game.session_minutes[1]) {
    fail(`${game.catalog_id}: session_minutes must be an increasing [minimum, maximum] pair`);
  }
  if (game.persistence.save_schema_version !== game.release.save_schema_version) {
    fail(`${game.catalog_id}: persistence and release save schema versions differ`);
  }

  const collectionPath = `_arcade_games/${game.slug}.md`;
  if (!existsSync(resolve(repositoryRoot, collectionPath))) fail(`${game.catalog_id}: missing ${collectionPath}`);
  const collectionSource = read(collectionPath);
  const frontMatterText = collectionSource.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontMatterText) fail(`${collectionPath}: missing YAML front matter`);
  const frontMatter = YAML.parse(frontMatterText);
  if (frontMatter.game_id !== game.id) fail(`${collectionPath}: game_id does not match registry`);
  if (frontMatter.title !== game.title) fail(`${collectionPath}: title does not match registry`);

  const references = game.provenance.paper_refs || [];
  for (const reference of references) {
    paperReferenceCount += 1;
    if (!publicationIds.has(reference.paper_id)) {
      fail(`${game.catalog_id}: paper #${reference.paper_id} does not resolve`);
    }
  }

  const entryPath = game.entry_module.replace(/^\//, "");
  if (existsSync(resolve(repositoryRoot, entryPath))) {
    implementedModuleCount += 1;
  } else if (game.status === "planned") {
    reservedModuleCount += 1;
  } else {
    fail(`${game.catalog_id}: ${game.status} game is missing ${game.entry_module}`);
  }
}

console.log(JSON.stringify({
  status: "valid",
  schemaVersion: 1,
  games: games.length,
  paperDerived: games.filter((game) => game.provenance.kind === "paper-derived").length,
  classics: games.filter((game) => game.category === "classic").length,
  paperReferences: paperReferenceCount,
  implementedModules: implementedModuleCount,
  reservedPlannedModules: reservedModuleCount
}, null, 2));
