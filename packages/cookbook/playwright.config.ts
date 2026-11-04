import { defineConfig } from "@playwright/test";

// E2E_PROD=true tests the production build under the GitHub Pages base, which
// the dev server can't exercise (hardcoded absolute paths work on base "/").
const prod = process.env.E2E_PROD === "true";
const port = prod ? 3002 : 3001;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: `http://localhost:${port}${prod ? "/gl-react/" : "/"}`,
    headless: true,
  },
  webServer: {
    command: prod
      ? `GH_PAGES=true pnpm exec vite build && GH_PAGES=true pnpm exec vite preview --port ${port} --strictPort`
      : `pnpm dev --port ${port}`,
    port,
    reuseExistingServer: true,
    timeout: prod ? 120000 : 15000,
  },
});
