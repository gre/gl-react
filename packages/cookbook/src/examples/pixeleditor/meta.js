import markdown from "../../markdown";
import ToolPicker from "./ToolPicker";
import Vec4ColorPicker from "../../toolbox/Vec4ColorPicker";
import { tools } from ".";

export const title = "Pixel Editor";
export const descAfter = markdown`
The rendering is 100% implemented in WebGL:

This re-use the same \`discard\` technique
and apply it to a 16x16 framebuffer.

DOWNLOAD is just a snapshot of that framebuffer.

The editor is rendered with a second shader
that scales up that framebuffer, draw the grid
and give hover feedback.
`;
export const toolbox = [
  { prop: "toolKey", Editor: ToolPicker, tools },
  { prop: "color", compact: true, Editor: Vec4ColorPicker },
];
