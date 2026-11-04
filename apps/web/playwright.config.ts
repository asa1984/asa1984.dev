import { defineConfig, devices } from "@playwright/test";

const port = 8792;
const baseURL = `http://localhost:${String(port)}`;

/**
 * End-to-end tests of the build output, served the way Cloudflare serves it (deploy/wrangler.jsonc).
 * They test what `vp run build` wrote, so build first; the test:e2e task does.
 */
export default defineConfig({
  testDir: "e2e",
  forbidOnly: true,
  // Every test runs on its own. The tests only read the static build, so no test may depend on
  // another having run or on their order.
  fullyParallel: true,
  globalTimeout: 10 * 60 * 1000,
  use: { baseURL },
  webServer: {
    command: `wrangler dev --config deploy/wrangler.jsonc --port ${String(port)}`,
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
