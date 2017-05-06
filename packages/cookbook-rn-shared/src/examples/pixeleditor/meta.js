import ToolPicker from "./ToolPicker";
import Vec3ColorPicker from "../../toolbox/Vec3ColorPicker";
import { tools } from ".";

export thumbnail from "../../../images/thumbnails/pixeleditor.png";
export const title = "Pixel Editor";
export const description = "Pixel Editor";

export const toolbox = [
  { prop: "toolKey", Editor: ToolPicker, tools },
  { prop: "color", Editor: Vec3ColorPicker },
];
