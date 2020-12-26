export default (
  canvas: HTMLCanvasElement,
  opts: any,
  version: "webgl" | "webgl2"
) =>
  version === "webgl2"
    ? canvas.getContext("webgl2", opts)
    : canvas.getContext("webgl", opts) ||
      canvas.getContext("webgl-experimental", opts) ||
      canvas.getContext("experimental-webgl", opts);
