import React from "react";
import markdown from "../../markdown";
import colorScales from "./colorScales";
import makeSelect from "../../toolbox/makeSelect";
import makeRadios from "../../toolbox/makeRadios";
import { LinearCopy, NearestCopy } from "gl-react";
import { Surface } from "gl-react-dom";

export const title = "color mapping an image with a gradient texture";
export const descAfter = markdown`
A gradient texture defines the color mapping
of the image greyscale.
`;

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
    Editor: makeRadios([
      { key: "linear", label: "linear interpolation" },
      { key: "nearest", label: "nearest interpolation" },
    ]),
  },
];

export const ToolboxFooter = ({ color, interpolation }) => (
  <Surface style={{ minWidth: "100%" }} width={400} height={20}>
    {interpolation === "linear" ? (
      <LinearCopy>{colorScales[color]}</LinearCopy>
    ) : (
      <NearestCopy>{colorScales[color]}</NearestCopy>
    )}
  </Surface>
);
