import StaticBlurMap from "../../toolbox/StaticBlurMap";
import thumbnail from "../../images/thumbnails/blurmapmouse.jpg";
export { thumbnail };
export const title = "Touchable Blur Map";
export const description = "Dynamically change Blur Map with touch move";
export const toolbox = [
  {
    prop: "map",
    title: "Blur Texture Map",
    Editor: StaticBlurMap,
  },
];
