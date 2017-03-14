import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Three.js Panorama demo";

export const toolbox = [
  { prop: "fov",
    title: "Field of View",
    Editor: makeFloatSlider(20, 100, 0.1) },
];
