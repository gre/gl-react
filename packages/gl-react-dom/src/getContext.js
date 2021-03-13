const getContext = (
  canvas: HTMLCanvasElement,
  opts: any,
  version: "webgl" | "webgl2" | "auto"
) => {
  let gl;
  if (version === "webgl2" || version === "auto") {
    gl = canvas.getContext("webgl2", opts);
  }
  if (!gl && (version === "webgl" || version === "auto")) {
    gl =
      canvas.getContext("webgl", opts) ||
      canvas.getContext("webgl-experimental", opts) ||
      canvas.getContext("experimental-webgl", opts);
  }
  return gl;
};

export default getContext;
