import React from "react";
import colorScales from "./colorScales";
import makeSelect from "../../toolbox/makeSelect";
import { LinearCopy, NearestCopy } from "gl-react";
import getGLReactImplementation from "../../gl-react-implementation";
const { Surface } = getGLReactImplementation();

export const title = "color mapping with gradient texture";
export const description =
  "A gradient texture defines the color mapping of the image greyscale.";

export const toolbox = [
  {
    prop: "color",
    title: "color scale",
    Editor: makeSelect(
      Object.keys(colorScales).map(cs => ({ key: cs, label: cs }))
    ),
  },
  {
    prop: "interpolation",
    Editor: makeSelect([
      { key: "linear", label: "linear interpolation" },
      { key: "nearest", label: "nearest interpolation" },
    ]),
  },
];

export const ToolboxFooter = ({ width, color, interpolation }) => (
  <Surface width={width} height={20}>
    {interpolation === "linear"
      ? <LinearCopy>{colorScales[color]}</LinearCopy>
      : <NearestCopy>{colorScales[color]}</NearestCopy>}
  </Surface>
);
