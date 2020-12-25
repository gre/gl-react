import React from "react";
import { Button } from "react-native";
import ImagesPicker from "../../toolbox/ImagesPicker";
import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/blurfeedback.jpg";
export { thumbnail };
export const images = [
  require("../../images/blurfeedback-1.jpg"),
  require("../../images/blurfeedback-2.jpg"),
  require("../../images/blurfeedback-3.jpg"),
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
    imageStyle: { width: 60, height: 40 },
    images,
  },
  {
    prop: "refreshId",
    title: "",
    Editor: ({ onChange, value }) => (
      <Button onPress={() => onChange(value + 1)} title="REFRESH" />
    ),
  },
];

export const title = "Blur feedback";

export const description = "buffering the result of a blur back to the source";
