import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Hello GL blue";

export const toolbox = [
  { prop: "blue",
    title: "Blue Color",
    Editor: makeFloatSlider(0, 1, 0.01) },
];
