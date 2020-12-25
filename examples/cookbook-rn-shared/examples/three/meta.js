import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/three.jpg";
export { thumbnail };
export const title = "Three.js cube skymap";
export const description = "EXGLView: Cube in skymap";

export const toolbox = [
  {
    prop: "fov",
    title: "Field of View",
    Editor: makeFloatSlider(40, 100, 0.1),
  },
];
