//@flow
import {View} from "react-native";
import {createSurface} from "gl-react";
import GLView from "./GLViewNative";

const RenderLessElement = View;

export const Surface = createSurface({
  GLView,
  RenderLessElement,
});
