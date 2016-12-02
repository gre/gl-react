export default (canvas: HTMLCanvasElement, opts: any) =>
  canvas.getContext("webgl", opts) ||
  canvas.getContext("webgl-experimental", opts) ||
  canvas.getContext("experimental-webgl", opts);
