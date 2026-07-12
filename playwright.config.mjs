import { defineConfig, devices } from "@playwright/test";

const port = Number.parseInt(process.env.ARCADE_TEST_PORT || "4173", 10);
const baseURL = `http://127.0.0.1:${port}`;
const localBrowserChannel = process.env.CI ? {} : { channel: "chrome" };
const phase = process.env.ARCADE_PHASE;
const reportRoot = phase ? `test-results/arcade/phase-${phase}` : "test-results/arcade";

export default defineConfig({
  testDir: "./tests/arcade/browser",
  outputDir: `${reportRoot}/playwright-artifacts`,
  snapshotDir: "./tests/arcade/visual/baselines",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css"
    }
  },
  reporter: [
    ["list"],
    ["json", { outputFile: `${reportRoot}/playwright-results.json` }],
    ["junit", { outputFile: `${reportRoot}/junit/playwright.xml` }],
    ["html", { outputFolder: `${reportRoot}/playwright-report`, open: "never" }]
  ],
  use: {
    baseURL,
    ...localBrowserChannel,
    colorScheme: "light",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: `bundle exec jekyll serve --host 127.0.0.1 --port ${port} --no-watch --strict_front_matter --destination /tmp/keldefrawy-arcade-e2e-${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chrome-desktop",
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    {
      name: "chrome-mobile",
      use: {
        ...devices["Pixel 5"]
      }
    }
  ]
});
