//@flow
import React, { Component } from "react";
import Slider from "@react-native-community/slider";

export default (min: number = 0, max: number = 1, step?: number) =>
  class FloatSlider extends Component {
    props: {
      value: number,
      onChange: (c: number) => any,
    };
    render() {
      const { onChange, value } = this.props;
      return (
        <Slider
          style={{ flex: 1 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
        />
      );
    }
  };
