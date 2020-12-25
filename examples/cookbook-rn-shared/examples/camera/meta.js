import thumbnail from "../../images/thumbnails/camera.jpg";
import makeSelect from "../../toolbox/makeSelect";
import { toolbox as colorscaleToolbox } from "../colorscale/meta";

export { thumbnail };
export const title = "camera";
export const description = "Camera stream + colorscale";

export const toolbox = [
  ...colorscaleToolbox,
  {
    prop: "type",
    title: "camera type",
    Editor: makeSelect([
      { key: "front", label: "front" },
      { key: "back", label: "back" },
    ]),
  },
];

/*
import React from "react";
import { LinearCopy, NearestCopy } from "gl-react";
import {Surface} from "../../gl-react-implementation";
export const ToolboxFooter = ({ width, color, interpolation }) => (
  <Surface style={{ width, height: 20 }}>
    {interpolation === "linear"
      ? <LinearCopy>{colorScales[color]}</LinearCopy>
      : <NearestCopy>{colorScales[color]}</NearestCopy>}
  </Surface>
);
*/
