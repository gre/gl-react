import ToolPicker from "./ToolPicker";
import Vec3ColorPicker from "../../toolbox/Vec3ColorPicker";
import {tools} from ".";

export const title = "Pixel Editor";

export const toolbox = [
  { prop: "toolKey", Editor: ToolPicker, tools },
  { prop: "color", Editor: Vec3ColorPicker },
];
