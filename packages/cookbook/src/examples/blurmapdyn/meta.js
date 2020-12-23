import markdown from "../../markdown";
import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "Blur with dynamic shader mapping";
export const desc = markdown`
Any arbitrary shader can be used as a blur map!
`;
export const toolbox = [
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0, 8, 0.2) },
  {
    prop: "passes",
    title: (value) => `Blur Passes (${value})`,
    Editor: makeFloatSlider(1, 8, 1),
  },
];
