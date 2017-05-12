import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "BlurXY";
export const description = "simple Blur (2-passes)";

export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2),
  },
];

export thumbnail from "../../../images/thumbnails/blurxy.jpg";
