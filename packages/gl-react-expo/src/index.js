//@flow
import { View } from "react-native";
import { createSurface, TextureLoaders } from "gl-react";
import GLView from "./GLViewNative";
import ExponentTextureLoader from "./ExponentTextureLoader";

TextureLoaders.add(ExponentTextureLoader);

const RenderLessElement = View;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
});
