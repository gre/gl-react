export const title = "camera";
export const description = "Camera stream + colorscale";
export thumbnail from "../../../images/thumbnails/camera.jpg";
export { toolbox } from "../colorscale/meta";

/*
import React from "react";
import { LinearCopy, NearestCopy } from "gl-react";
import getGLReactImplementation from "../../gl-react-implementation";
const { Surface } = getGLReactImplementation();
export const ToolboxFooter = ({ width, color, interpolation }) => (
  <Surface style={{ width, height: 20 }}>
    {interpolation === "linear"
      ? <LinearCopy>{colorScales[color]}</LinearCopy>
      : <NearestCopy>{colorScales[color]}</NearestCopy>}
  </Surface>
);
*/
