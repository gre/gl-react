const getContext = (
  canvas: HTMLCanvasElement,
  opts: any,
  version: "webgl" | "webgl2" | "auto"
) => {
  let gl: WebGLRenderingContext | null = null;
  if (version === "webgl2" || version === "auto") {
    gl = canvas.getContext("webgl2", opts) as WebGLRenderingContext | null;
  }
  if (!gl && (version === "webgl" || version === "auto")) {
    gl =
      (canvas.getContext("webgl", opts) as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "webgl-experimental" as any,
        opts
      ) as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl" as any,
        opts
      ) as WebGLRenderingContext | null);
  }
  return gl;
};

export default getContext;
