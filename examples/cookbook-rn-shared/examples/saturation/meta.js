import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/saturation.jpg";
export { thumbnail };
export const title = "saturation";
export const description = "Contrast/Saturation/Brightness example";

export const toolbox = [
  {
    prop: "contrast",
    title: "Contrast",
    Editor: makeFloatSlider(0, 2, 0.05),
  },
  {
    prop: "saturation",
    title: "Saturation",
    Editor: makeFloatSlider(0, 2, 0.05),
  },
  {
    prop: "brightness",
    title: "Brightness",
    Editor: makeFloatSlider(0, 2, 0.05),
  },
];
