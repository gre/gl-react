import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Three.js demo";

export const toolbox = [
  { prop: "fov",
    title: "Field of View",
    Editor: makeFloatSlider(40, 100, 0.1) },
];
