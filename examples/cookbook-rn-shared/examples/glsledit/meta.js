import { StyleSheet } from "react-native";
import makeTextArea from "../../toolbox/makeTextArea";
import thumbnail from "../../images/thumbnails/glsledit.jpg";
export { thumbnail };
export const title = "GLSL Edit";
export const description = "GLSL Live Editor";
const styles = StyleSheet.create({
  editor: {
    flex: 1,
    height: 400,
    padding: 10,
    margin: 0,
    backgroundColor: "#282c34",
    color: "#ABB2BF",
    fontSize: 10,
    fontFamily: "Courier New",
  },
});

export const overrideStyles = StyleSheet.create({
  toolbox: {
    paddingBottom: 0,
  },
  field: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export const toolbox = [
  {
    prop: "frag",
    Editor: makeTextArea(styles.editor),
  },
];
