import makeFloatSlider from "../../toolbox/makeFloatSlider";
import markdown from "../../markdown";
export const title = "Contrast/Saturation/Brightness example";
export const descAfter = markdown`
More classical image effects
`;

export const toolbox = [
  { prop: "contrast", title: "Contrast", Editor: makeFloatSlider(0, 2, 0.05) },
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
