import makeFloatSlider from "../../toolbox/makeFloatSlider";
import StaticBlurMap from "../../toolbox/StaticBlurMap";

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
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0, 8, 0.2) },
  {
    prop: "passes",
    title: (value) => `Blur Passes (${value})`,
    Editor: makeFloatSlider(1, 8, 1),
  },
  { prop: "map", title: "Blur Texture Map", Editor: StaticBlurMap },
];
export const title = "Video + multi-pass Blur + contrast/saturation/brightness";
