import React from "react";
import colorScales from "./colorScales";
import makeSelect from "../../toolbox/makeSelect";
import { LinearCopy, NearestCopy } from "gl-react";
import { Surface } from "../../gl-react-implementation";

import thumbnail from "../../images/thumbnails/colorscale.jpg";
export { thumbnail };
export const title = "colorscale";
export const description =
  "A gradient defines color mapping of the image greyscale";

export const toolbox = [
  {
    prop: "color",
    title: "color scale",
    Editor: makeSelect(
      Object.keys(colorScales).map((cs) => ({ key: cs, label: cs }))
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
  <Surface style={{ width, height: 20 }}>
    {interpolation === "linear" ? (
      <LinearCopy>{colorScales[color]}</LinearCopy>
    ) : (
      <NearestCopy>{colorScales[color]}</NearestCopy>
    )}
  </Surface>
);
