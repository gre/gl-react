import Vec3ColorPicker from "../../toolbox/Vec3ColorPicker";
import thumbnail from "../../images/thumbnails/colordisc.jpg";
export { thumbnail };
export const toolbox = [
  { prop: "fromColor", title: "fromColor", Editor: Vec3ColorPicker },
  { prop: "toColor", title: "toColor", Editor: Vec3ColorPicker },
];

export const title = "Colored Disc";
export const description = "Implement a simple radial gradient.";
