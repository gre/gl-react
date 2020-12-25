import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/blurmulti.jpg";
export { thumbnail };
export const title = "Blur multi";
export const description = "multi-pass Blur";

export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2),
  },
  {
    prop: "passes",
    title: (passes) => `Blur Passes (${passes})`,
    Editor: makeFloatSlider(0, 8, 1),
  },
];
