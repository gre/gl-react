import { test, expect, type Page } from "@playwright/test";

const exampleIds = [
  "hellogl",
  "helloblue",
  "helloblueanim",
  "colordisc",
  "gradients",
  "heart",
  "saturation",
  "colorscale",
  "mergechannels",
  "mergechannelsfun",
  "diamondcrop",
  "diamondhello",
  "diamondanim",
  "blurxy",
  "blurxydownscale",
  "blurmulti",
  "blurmap",
  "blurmapdyn",
  "blurmapmouse",
  "blurimgtitle",
  "blurvideo",
  "blurfeedback",
  "demotunnel",
  "demodesert",
  "demodesertcrt",
  "sdf1",
  "gol",
  "golglider",
  "golrot",
  "golrotscu",
  "golwebcam",
  "distortion",
  "glsledit",
  "paint",
  "pixeleditor",
  "animated",
  "reactmotion",
  "textanimated",
  "textfunky",
  "video",
  "webcam",
  "webcampersistence",
  "transitions",
  "behindasteroids",
  "ibex",
  "imageeffects",
  "imageresizemodes",
];

function filterWebGLErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      !e.includes("WebGL") &&
      !e.includes("GL_") &&
      !e.includes("getUserMedia") &&
      !e.includes("Failed to create WebGL context") &&
      !e.includes("no-webgl-context")
  );
}

// Collects uncaught errors and same-origin HTTP failures (e.g. a missing asset).
// Remote images are left out so that a third-party outage can't fail the suite.
function trackProblems(page: Page, baseURL: string | undefined): string[] {
  const problems: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on("pageerror", (err) => problems.push(err.message));
  page.on("response", (res) => {
    if (res.status() >= 400 && new URL(res.url()).origin === origin) {
      problems.push(`${res.status()} ${res.url()}`);
    }
  });
  return problems;
}

test("homepage loads", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("./");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=gl-react")).toBeVisible();
  expect(filterWebGLErrors(problems)).toEqual([]);
});

test("examples page loads", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("examples");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=Examples")).toBeVisible();
  expect(filterWebGLErrors(problems)).toEqual([]);
});

for (const id of exampleIds) {
  test(`example "${id}" loads without errors`, async ({ page, baseURL }) => {
    const problems = trackProblems(page, baseURL);

    await page.goto(`examples/${id}`);
    await page.waitForLoadState("networkidle");

    // Wait for lazy-loaded component to render (canvas visible)
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 10000 }).catch(() => {});

    // Ensure the example loaded (not the "not found" fallback)
    await expect(page.locator("text=Example not found")).toHaveCount(0);

    expect(filterWebGLErrors(problems)).toEqual([]);
  });
}
