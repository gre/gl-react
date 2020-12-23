import makeTextArea from "../../toolbox/makeTextArea";
import { size, font, lineHeight, padding } from ".";
export const title = "Edit text with an input";
export const descAfter = `animated and editable text is funnier!`;

export const toolbox = [
  {
    prop: "text",
    Editor: makeTextArea({
      height: size.height,
      font,
      padding,
      lineHeight: lineHeight + "px",
      margin: 0,
      boxSizing: "border-box",
      border: "none",
    }),
  },
];
