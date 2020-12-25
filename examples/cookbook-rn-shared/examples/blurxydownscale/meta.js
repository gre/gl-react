import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/blurxydownscale.jpg";
export { thumbnail };
export const title = "BlurXY downscale";
export const description = "simple Blur after image downscale";

export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0.2, 0.8, 0.02),
  },
];
