import ToolPicker from "./ToolPicker";
import Vec3ColorPicker from "../../toolbox/Vec3ColorPicker";
import { tools } from ".";

import thumbnail from "../../images/thumbnails/pixeleditor.jpg";
export { thumbnail };
export const title = "Pixel Editor";
export const description = "Pixel Editor";

export const toolbox = [
  { prop: "toolKey", Editor: ToolPicker, tools },
  { prop: "color", Editor: Vec3ColorPicker },
];
