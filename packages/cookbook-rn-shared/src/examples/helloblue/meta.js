import makeFloatSlider from "../../toolbox/makeFloatSlider";

export thumbnail from "../../../images/thumbnails/helloblue.jpg";
export const title = "Hello GL blue";
export const description = "from React prop to GL Shader uniforms";

export const toolbox = [
  {
    prop: "blue",
    title: "Blue Color",
    Editor: makeFloatSlider(0, 1, 0.01),
  },
];
