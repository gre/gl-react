import { expect, type Page } from "@playwright/test";

// Fewer distinct colors than this means nothing useful was drawn. Images are
// downscaled before counting, so even black-and-white examples blend past it.
const MIN_COLORS = 4;

// Collects uncaught errors, console errors and same-origin HTTP failures (e.g. a
// missing asset). Remote images are stubbed by stubRemoteImages.
export function trackProblems(page: Page, baseURL: string | undefined): string[] {
  const problems: string[] = [];
  const origin = new URL(baseURL!).origin;
  // Also logged: a blank canvas fails the test before `problems` is checked.
  const report = (problem: string) => {
    problems.push(problem);
    console.error(`[page] ${problem}`);
  };
  page.on("pageerror", (err) => report(err.stack ?? err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") report(msg.text());
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && new URL(res.url()).origin === origin) {
      report(`${res.status()} ${res.url()}`);
    }
  });
  return problems;
}

// Serves a local image for imgur URLs, so an outage there can't fail the suite.
export async function stubRemoteImages(page: Page, image: string): Promise<void> {
  await page.route("https://i.imgur.com/**", (route) =>
    route.fulfill({
      path: image,
      contentType: "image/png",
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  );
}

async function countCanvasColors(page: Page): Promise<number> {
  const png = await page.locator("canvas").first().screenshot();
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(image.width, 200);
    canvas.height = Math.min(image.height, 200);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = new Set<number>();
    for (let i = 0; i < data.length; i += 4) {
      // Keep 5 bits per channel, so noise doesn't count as distinct colors.
      colors.add(
        (data[i] >> 3) | ((data[i + 1] >> 3) << 5) | ((data[i + 2] >> 3) << 10)
      );
    }
    return colors.size;
  }, png.toString("base64"));
}

// Polls because examples draw only once their shaders and textures are ready.
export async function expectCanvasRendered(page: Page): Promise<void> {
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 15000 });
  await expect
    .poll(() => countCanvasColors(page), {
      message: "canvas should draw several colors",
      timeout: 20000,
    })
    .toBeGreaterThanOrEqual(MIN_COLORS);
  // In development, a shader error shows as a colorful overlay next to the canvas
  // instead of an exception, so the checks above can't see it.
  await expect(page.locator("canvas ~ div")).toHaveCount(0);
}

// paint starts blank, so it has to be drawn on first.
export async function drawOnCanvas(page: Page): Promise<void> {
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 15000 });
  const box = (await canvas.boundingBox())!;
  const [x, y] = [box.x + box.width / 4, box.y + box.height / 4];
  // Each stroke picks a new color, so several strokes give several colors.
  for (let stroke = 0; stroke < 6; stroke++) {
    await page.mouse.move(x, y + stroke * 30);
    await page.mouse.down();
    await page.mouse.move(x + box.width / 2, y + stroke * 30, { steps: 12 });
    await page.mouse.up();
  }
}
