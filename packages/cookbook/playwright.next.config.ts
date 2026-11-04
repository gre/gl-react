import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

const port = 3003;
const yarn = "COREPACK_ENABLE_STRICT=0 corepack yarn@1.22.22";

// examples/next-js is outside the pnpm workspace and installs gl-react from npm,
// so it has no Playwright of its own, and needs its own `yarn install` first.
export default defineConfig({
  ...base,
  testDir: "./e2e-next",
  use: { ...base.use, baseURL: `http://localhost:${port}/` },
  webServer: {
    command: `${yarn} build && ${yarn} start -p ${port}`,
    cwd: "../../examples/next-js",
    port,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
