
//@flow
import {createSurface, TextureLoaders} from "gl-react";
import GLView from "./GLViewDOM";
import ImageTextureLoader from "./ImageTextureLoader";
import CanvasTextureLoader from "./CanvasTextureLoader";
import VideoTextureLoader from "./VideoTextureLoader";

TextureLoaders.add(ImageTextureLoader);
TextureLoaders.add(CanvasTextureLoader);
TextureLoaders.add(VideoTextureLoader);

const getPixelSize =
  ({ width, height, pixelRatio = Number(window.devicePixelRatio||1) }) =>
  [ pixelRatio * width, pixelRatio * height ];

const RenderLessElement = "span";

export * from "./legacy";

const mapRenderableContent = (el: mixed) =>
  el instanceof Element
  ? el.firstElementChild
  : null;

export const Surface = createSurface({
  GLView,
  getPixelSize,
  RenderLessElement,
  mapRenderableContent,
});
