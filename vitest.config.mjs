import { defineConfig } from "vitest/config";

const phase = process.env.ARCADE_PHASE;
const reportRoot = phase ? `test-results/arcade/phase-${phase}` : "test-results/arcade";

export default defineConfig({
  test: {
    include: ["tests/arcade/**/*.test.mjs"],
    exclude: ["tests/arcade/browser/**"],
    environment: "node",
    globals: false,
    reporters: ["default", "json", "junit"],
    outputFile: {
      json: `${reportRoot}/vitest-results.json`,
      junit: `${reportRoot}/junit/vitest.xml`
    },
    testTimeout: 10_000,
    hookTimeout: 10_000,
    restoreMocks: true,
    clearMocks: true
  }
});
