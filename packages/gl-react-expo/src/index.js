//@flow
import { View } from "react-native";
import { createSurface, TextureLoaders } from "gl-react";
import GLView from "./GLViewNative";
import ExponentTextureLoader from "./ExponentTextureLoader";
import ExponentGLObjectTextureLoader from "./ExponentGLObjectTextureLoader";

TextureLoaders.add(ExponentTextureLoader);
TextureLoaders.add(ExponentGLObjectTextureLoader);

const RenderLessElement = View;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
  requestFrame: global.requestAnimationFrame,
  cancelFrame: global.cancelAnimationFrame,
});
