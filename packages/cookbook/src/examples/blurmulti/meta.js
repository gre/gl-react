import markdown from "../../markdown";
import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "multi-pass Blur";
export const desc = markdown`
For a better Blur quality, we need more than 2 passes.
We generalize the concept to make a N-passes component.
4-passes Blur is good enough, even without downscaling.
`;
export const descAfter = markdown`
We apply blur on various direction, not just X and Y axis.
We also vary the intensity for each pass.
\`directionForPass\` implements this empirical approach.
`;

export const toolbox = [
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0, 8, 0.2) },
  {
    prop: "passes",
    title: (passes) => `Blur Passes (${passes})`,
    Editor: makeFloatSlider(0, 8, 1),
  },
];
