import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "simple Blur (2-passes)";

export const toolbox = [
  { prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2) },
];
