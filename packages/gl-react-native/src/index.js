//@flow
import {View} from "react-native";
import {createSurface} from "gl-react";
import GLView from "./GLViewNative";

const getPixelSize = ({ width, height }) => {
  //const pixelRatio = PixelRatio.get(); // you can't change it (for now)
  const pixelRatio=1;// FIXME mmh
  return [ pixelRatio * width, pixelRatio * height ];
};

const RenderLessElement = View;

export const Surface = createSurface({
  GLView,
  getPixelSize,
  RenderLessElement,
});
