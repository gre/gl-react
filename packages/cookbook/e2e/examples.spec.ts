import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import {
  drawOnCanvas,
  expectCanvasRendered,
  stubRemoteImages,
  trackProblems,
} from "./helpers";

const stubImage = fileURLToPath(
  new URL("../public/assets/mario.png", import.meta.url)
);

// Read from the examples index, so that a new example can't be left out.
const exampleIds = [
  ...readFileSync(
    new URL("../src/examples/index.ts", import.meta.url),
    "utf8"
  ).matchAll(/\bid: "([^"]+)"/g),
].map((match) => match[1]);

test.beforeEach(async ({ page }) => {
  await stubRemoteImages(page, stubImage);
});

test("the index lists the examples", () => {
  expect(exampleIds.length).toBeGreaterThan(40);
});

test("homepage loads", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("./");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=gl-react").first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("examples page loads", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("examples");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("text=Examples").first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("links navigate without reloading the page", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("./");
  await page.evaluate(() => {
    (window as any).__noReload = true;
  });

  await page.getByRole("link", { name: "Explore Examples" }).click();
  await expect(page).toHaveURL(/\/examples$/);

  await page.locator('a[href$="/examples/hellogl"]').first().click();
  await expect(page).toHaveURL(/\/examples\/hellogl$/);
  await expectCanvasRendered(page);

  await page.goBack();
  await expect(page).toHaveURL(/\/examples$/);

  // This one also loads a local asset, whose URL depends on the base path.
  await page.locator('a[href$="/examples/colorscale"]').first().click();
  await expect(page).toHaveURL(/\/examples\/colorscale$/);
  await expectCanvasRendered(page);

  expect(await page.evaluate(() => (window as any).__noReload)).toBe(true);
  expect(problems).toEqual([]);
});

for (const id of exampleIds) {
  test(`example "${id}" renders without errors`, async ({ page, baseURL }) => {
    const problems = trackProblems(page, baseURL);

    await page.goto(`examples/${id}`);
    await expect(page.locator("text=Example not found")).toHaveCount(0);

    if (id === "paint") await drawOnCanvas(page);
    await expectCanvasRendered(page);

    expect(problems).toEqual([]);
  });
}
