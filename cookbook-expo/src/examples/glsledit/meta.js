import { StyleSheet } from "react-native";
export const title = "GLSL live editor";
import makeTextArea from "../../toolbox/makeTextArea";

const styles = StyleSheet.create({
  editor: {
    flex: 1,
    height: 400,
    padding: 10,
    margin: 0,
    backgroundColor: "#282c34",
    color: "#ABB2BF",
    fontSize: 10,
    lineHeight: 1.5,
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
  }
});

export const toolbox = [
  { prop: "frag",
    Editor: makeTextArea(styles.editor) }
];
