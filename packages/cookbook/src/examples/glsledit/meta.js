import "./glsledit.css";
import makeTextArea from "../../toolbox/makeTextArea";

export const title = "GLSL live editor";

export const toolbox = [
  {
    prop: "frag",
    Editor: makeTextArea({
      height: 400,
      padding: 10,
      margin: 0,
      boxSizing: "border-box",
      border: "none",
      backgroundColor: "#282c34",
      color: "#ABB2BF",
      fontSize: 10,
      lineHeight: 1.5,
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    }),
  },
];
