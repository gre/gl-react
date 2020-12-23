import markdown from "../../markdown";
import StaticBlurMap from "../../toolbox/StaticBlurMap";
import makeFloatSlider from "../../toolbox/makeFloatSlider";
export const title = "Blur with intensity map & multi-pass";
export const desc = markdown`
common use-case: vary Blur based on the position
`;
export const descAfter = markdown`
We use a texture to map the depth of the Blur.
`;
export const toolbox = [
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0, 8, 0.2) },
  {
    prop: "passes",
    title: (value) => `Blur Passes (${value})`,
    Editor: makeFloatSlider(1, 8, 1),
  },
  { prop: "map", title: "Blur Texture Map", Editor: StaticBlurMap },
];
