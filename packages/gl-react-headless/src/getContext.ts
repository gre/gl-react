import createGL from "gl";

export default function getContext(
  canvas: any,
  opts?: any
): WebGLRenderingContext {
  return createGL(canvas.width, canvas.height, opts);
}
