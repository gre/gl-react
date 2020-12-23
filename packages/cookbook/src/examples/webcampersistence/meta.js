import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "WebCam persistence";

export const toolbox = [
  {
    prop: "persistence",
    title: "Persistence",
    Editor: makeFloatSlider(0.5, 0.99, 0.002),
  },
];
