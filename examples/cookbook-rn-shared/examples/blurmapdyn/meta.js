import makeFloatSlider from "../../toolbox/makeFloatSlider";
import thumbnail from "../../images/thumbnails/blurmapdyn.jpg";
export { thumbnail };
export const title = "Blur Map with dynamic shader";
export const desc = "Any arbitrary shader can be used as a blur map!";
export const toolbox = [
  {
    prop: "factor",
    title: "Blur",
    Editor: makeFloatSlider(0, 8, 0.2),
  },
  {
    prop: "passes",
    title: (value) => `Blur Passes (${value})`,
    Editor: makeFloatSlider(1, 8, 1),
  },
];
