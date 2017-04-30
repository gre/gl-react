//@flow
import { View } from "react-native";
import { createSurface, TextureLoaders } from "gl-react";
import EXGLView from "./EXGLView";
import GLView from "./GLViewNative";
import Image from "./Image";
import ImageSourceTextureLoader from "./ImageSourceTextureLoader";
TextureLoaders.add(ImageSourceTextureLoader);

const RenderLessElement = View;

export { EXGLView, Image };

export const Surface = createSurface({
  GLView,
  RenderLessElement,
});
