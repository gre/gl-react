
//@flow
import {createSurface, TextureLoaders} from "gl-react";
import GLView from "./GLViewDOM";
import ImageTextureLoader from "./ImageTextureLoader";
import CanvasTextureLoader from "./CanvasTextureLoader";
import VideoTextureLoader from "./VideoTextureLoader";

TextureLoaders.add(ImageTextureLoader);
TextureLoaders.add(CanvasTextureLoader);
TextureLoaders.add(VideoTextureLoader);

const RenderLessElement = "span";

export * from "./legacy";

const mapRenderableContent = (el: mixed) =>
  el instanceof Element
  ? el.firstElementChild
  : null;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
  mapRenderableContent,
});
