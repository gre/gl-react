//@flow
import React, { PureComponent } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

const styles = StyleSheet.create({
  tools: {
    flexDirection: "row",
  },
  tool: {
    borderWidth: 2,
    marginHorizontal: 10,
    width: 40,
    height: 40,
  },
  toolSelected: {
    borderColor: "#f00",
  },
});

const imageMapping = {
  "brush-1": require("../../images/pixeleditor-brush-1.png"),
  "brush-2": require("../../images/pixeleditor-brush-2.png"),
  "brush-4": require("../../images/pixeleditor-brush-4.png"),
  rubber: require("../../images/pixeleditor-rubber.png"),
  "color-picker": require("../../images/pixeleditor-color-picker.png"),
};

class Tool extends PureComponent {
  props: {
    id: string,
    selected: boolean,
    onChange: (key: string) => void,
  };
  onPress = () => this.props.onChange(this.props.id);
  render() {
    const { id, selected } = this.props;
    return (
      <TouchableOpacity onPress={this.onPress}>
        <Image
          style={[styles.tool, selected && styles.selected]}
          source={imageMapping[id]}
        />
      </TouchableOpacity>
    );
  }
}

export default class ToolPicker extends PureComponent {
  render() {
    const { tools, value, onChange } = this.props;
    return (
      <View style={styles.tools}>
        {Object.keys(tools).map((key) => (
          <Tool
            key={key}
            id={key}
            selected={key === value}
            onChange={onChange}
          />
        ))}
      </View>
    );
  }
}
