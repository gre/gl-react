import { createSurface } from "gl-react";
import raf from "raf";
import GLView from "./GLViewDOM";
import "webgltexture-loader-dom";

const RenderLessElement = "span";

const mapRenderableContent = (el: any) =>
  el instanceof Element ? el.firstElementChild : null;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
  mapRenderableContent,
  requestFrame: raf,
  cancelFrame: raf.cancel,
});
