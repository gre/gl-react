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

test("homepage loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=gl-react")).toBeVisible();
  expect(errors).toEqual([]);
});

test("examples page loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/examples");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=Examples")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const id of exampleIds) {
  test(`example "${id}" loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`/examples/${id}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Filter out WebGL/GPU errors that happen in headless CI
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("WebGL") &&
        !e.includes("GL_") &&
        !e.includes("getUserMedia") &&
        !e.includes("getContext")
    );

    expect(criticalErrors).toEqual([]);
  });
}
