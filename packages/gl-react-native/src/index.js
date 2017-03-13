//@flow
import {View} from "react-native";
import {createSurface, TextureLoaders} from "gl-react";
import GLView from "./GLViewNative";
import ImageSourceTextureLoader from "./ImageSourceTextureLoader";
TextureLoaders.add(ImageSourceTextureLoader);

const RenderLessElement = View;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
});
