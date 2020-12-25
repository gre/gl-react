//@flow
import React, { Component } from "react";
import { StyleSheet, View, PixelRatio } from "react-native";
import Slider from "@react-native-community/slider";

export type Vec3 = [number, number, number];

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  preview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1 / PixelRatio.get(),
  },
});

export default class Vec3ColorPicker extends Component {
  props: {
    compact?: boolean,
    value: Vec3,
    onChange: (c: Vec3) => any,
  };
  render() {
    const { value, onChange } = this.props;
    let [r, g, b] = value || [];
    const step = 0.01;
    return (
      <View style={styles.root}>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: `rgb(${[r, g, b].map((v) =>
                Math.floor(v * 255)
              )})`,
              borderColor: `rgb(${[r, g, b].map((v) =>
                Math.floor(0.8 * v * 255)
              )})`,
            },
          ]}
        />
        <Slider
          style={styles.slider}
          value={r}
          step={step}
          onValueChange={(r) => onChange([r, g, b])}
        />
        <Slider
          style={styles.slider}
          value={g}
          step={step}
          onValueChange={(g) => onChange([r, g, b])}
        />
        <Slider
          style={styles.slider}
          value={b}
          step={step}
          onValueChange={(b) => onChange([r, g, b])}
        />
      </View>
    );
  }
}
