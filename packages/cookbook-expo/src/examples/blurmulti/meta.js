import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "multi-pass Blur";

export const toolbox = [
  { prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2) },
  { prop: "passes",
    title: passes => `Blur Passes (${passes})`,
    Editor: makeFloatSlider(0, 8, 1) },
];
