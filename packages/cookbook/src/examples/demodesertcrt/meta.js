import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Desert Shadertoy + CRT effect + snapshot()";

export const toolbox = [
  {
    prop: "distortion",
    title: "Distortion",
    Editor: makeFloatSlider(0, 1, 0.01),
  },
];
