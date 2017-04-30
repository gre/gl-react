import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "simple Blur + downscale";

export const toolbox = [
  { prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0.2, 0.8, 0.02) },
];
