import React from "react";
import markdown from "../../markdown";
import ImagesPicker from "../../toolbox/ImagesPicker";
import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const images = [
  require("./1.jpg").default,
  require("./2.jpg").default,
  require("./3.jpg").default,
];

export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2),
  },
  {
    prop: "image",
    title: "Image",
    Editor: ImagesPicker,
    style: { width: 400 },
    imageStyle: { maxWidth: 56, maxHeight: 56, marginBottom: 16 },
    images,
  },
  {
    prop: "refreshId",
    title: "",
    Editor: ({ onChange, value }) => (
      <button
        style={{ fontSize: "1.4em", lineHeight: "1.4em" }}
        onClick={() => onChange(value + 1)}
      >
        REFRESH
      </button>
    ),
  },
];

export const title = "Blur feedback";

export const desc = markdown`
buffering the result of a blur back to the source
`;
