import markdown from "../../markdown";
import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "simple Blur + downscale";
export const desc = markdown`
[BlurXY](/blurxy) allows to override width/height (\`connectSize\`),
we can downscale the Blur to accentuate the Blur effect.
`;
export const descAfter = markdown`
It also bring better performance (less pixels to process).
But it's still a quality tradeoff and a balance to found.

[Next example](/blurmulti) will do more than 2 passes for better quality.
`;

export const toolbox = [
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0.2, 0.8, 0.02) },
];
