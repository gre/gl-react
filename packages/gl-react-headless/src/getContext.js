import createGL from "gl";

export default function getContext(canvas, opts) {
  return createGL(canvas.width, canvas.height, opts);
}
