//@flow
import React, { Component } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    width: 120,
    textAlign: "right",
    fontSize: 14,
  },
  value: {
    width: 80,
  },
  range: {
    flex: 1,
    height: 20,
    margin: 6,
  },
});

export default class Field extends Component {
  props: {
    value: number,
    id: string,
    name: string,
    min?: number,
    max?: number,
    step?: number,
    prettyPrint: (value: number) => string,
    onChange: (value: number, id: string) => void,
    onReset: (id: string) => void,
  };
  onChange = (value: number) => {
    this.props.onChange(value, this.props.id);
  };
  onReset = () => {
    this.props.onReset(this.props.id);
  };
  render() {
    const { min, max, step, value, name, prettyPrint } = this.props;
    return (
      <View style={styles.field}>
        <TouchableOpacity onPress={this.onReset}>
          <Text style={styles.title}>{name}</Text>
        </TouchableOpacity>
        <Slider
          style={styles.range}
          minimumValue={min}
          maximumValue={max}
          step={step || 0.01}
          value={value}
          onValueChange={this.onChange}
        />
        <Text style={styles.value}>{prettyPrint(value)}</Text>
      </View>
    );
  }
}
