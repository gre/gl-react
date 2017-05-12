import makeFloatSlider from "../../toolbox/makeFloatSlider";

export thumbnail from "../../../images/thumbnails/demodesertcrt.jpg";
export const title = "Desert + CRT";
export const description = "Desert Shadertoy + CRT effect + snapshot()";

export const toolbox = [
  {
    prop: "distortion",
    title: "Distortion",
    Editor: makeFloatSlider(0, 1, 0.01),
  },
];
