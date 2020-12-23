import markdown from "../../markdown";
import StaticBlurMap from "../../toolbox/StaticBlurMap";
export const title = "Blur map and Mouse position";
export const desc = markdown`
Dynamically change Blur Map with mouse move
`;
export const descAfter = markdown`
This example is the first to show the need of Sharing Computation:
We want the "offset" framebuffer to be computed once,
we use gl-react [\`<Bus>\`](/api#bus) concept for this.
`;
export const toolbox = [
  { prop: "map", title: "Blur Texture Map", Editor: StaticBlurMap },
];
