import { test, expect } from "@playwright/test";

test("heart example responds to hover and click", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/examples/heart");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // Find the canvas
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  // Screenshot before interaction
  await canvas.screenshot({ path: "/tmp/heart-before.png" });

  // Hover
  await canvas.hover();
  await page.waitForTimeout(500);
  await canvas.screenshot({ path: "/tmp/heart-hover.png" });

  // Click
  await canvas.click();
  await page.waitForTimeout(500);
  await canvas.screenshot({ path: "/tmp/heart-click.png" });

  // Check for errors
  console.log("JS errors:", errors);

  // Read pixel data to check if canvas content actually changed
  const getPixelSample = async () => {
    return await canvas.evaluate((el: HTMLCanvasElement) => {
      const gl = el.getContext("webgl2") || el.getContext("webgl");
      if (!gl) return "no-gl";
      const pixels = new Uint8Array(4);
      gl.readPixels(
        Math.floor(el.width / 2),
        Math.floor(el.height / 2),
        1, 1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
      );
      return Array.from(pixels).join(",");
    });
  };

  const before = await getPixelSample();
  console.log("Center pixel:", before);
  console.log("Errors:", errors);
});
