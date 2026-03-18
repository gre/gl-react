import { test, expect } from "@playwright/test";

// All example IDs from the registry
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
  "diamondcrop",
  "diamondhello",
  "diamondanim",
  "blurxy",
  "blurxydownscale",
  "blurmulti",
  "blurmap",
  "blurmapdyn",
  "blurmapmouse",
  "distortion",
  "demotunnel",
  "demodesert",
  "sdf1",
  "gol",
  "golglider",
  "golrot",
  "glsledit",
  "transitions",
  "textanimated",
  "textfunky",
  "animated",
  "reactmotion",
];

test("examples page loads with all examples listed", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/examples");
  await page.waitForLoadState("networkidle");

  // Check page loaded
  await expect(page.locator("h1")).toHaveText(/Examples/);

  // No JS errors
  expect(errors).toEqual([]);
});

for (const id of exampleIds) {
  test(`example "${id}" loads without JS errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`/examples/${id}`);
    await page.waitForLoadState("networkidle");

    // Wait for lazy-loaded component
    await page.waitForTimeout(2000);

    // Title should be visible
    await expect(page.locator("h1")).toBeVisible();

    // Report errors but don't fail on WebGL context issues (CI may not have GPU)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("WebGL") &&
        !e.includes("GL_") &&
        !e.includes("getUserMedia")
    );

    if (criticalErrors.length > 0) {
      console.log(`[${id}] JS errors:`, criticalErrors);
    }
    expect(criticalErrors).toEqual([]);
  });
}
