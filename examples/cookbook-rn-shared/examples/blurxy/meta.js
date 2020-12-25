import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/blurxy.jpg";
export { thumbnail };
export const title = "BlurXY";
export const description = "simple Blur (2-passes)";

export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2),
  },
];
