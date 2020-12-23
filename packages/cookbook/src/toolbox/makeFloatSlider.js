//@flow
import React, { Component } from "react";

export default (min: number = 0, max: number = 1, step?: number) =>
  class FloatSlider extends Component {
    props: {
      value: number,
      onChange: (c: number) => any,
    };
    onChange = (e: any) => this.props.onChange(parseFloat(e.target.value));
    render() {
      return (
        <input
          style={{ flex: 1, width: "100%" }}
          type="range"
          min={min}
          max={max}
          step={step}
          value={this.props.value}
          onChange={this.onChange}
        />
      );
    }
  };
