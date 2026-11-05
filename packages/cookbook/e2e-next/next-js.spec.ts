import { test, expect } from "@playwright/test";
import { expectCanvasRendered, trackProblems } from "../e2e/helpers";

test("the Next.js example renders", async ({ page, baseURL }) => {
  const problems = trackProblems(page, baseURL);
  await page.goto("/");
  await expectCanvasRendered(page);
  expect(problems).toEqual([]);
});
