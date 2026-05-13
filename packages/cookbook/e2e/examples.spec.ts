import { test, expect } from "@playwright/test";

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

test("homepage loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=gl-react")).toBeVisible();
  expect(filterWebGLErrors(errors)).toEqual([]);
});

test("examples page loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/examples");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=Examples")).toBeVisible();
  expect(filterWebGLErrors(errors)).toEqual([]);
});

for (const id of exampleIds) {
  test(`example "${id}" loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`/examples/${id}`);
    await page.waitForLoadState("networkidle");

    // Wait for lazy-loaded component to render (canvas visible)
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 10000 }).catch(() => {});

    // Ensure the example loaded (not the "not found" fallback)
    await expect(page.locator("text=Example not found")).toHaveCount(0);

    expect(filterWebGLErrors(errors)).toEqual([]);
  });
}
