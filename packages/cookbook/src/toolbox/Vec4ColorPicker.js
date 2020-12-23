//@flow
import React, { Component } from "react";
import { SliderPicker, CompactPicker } from "react-color";

export type Vec4 = [number, number, number, number];

export default class Vec4ColorPicker extends Component {
  props: {
    compact?: boolean,
    value: Vec4,
    onChange: (c: Vec4) => any,
  };
  onChange = ({ rgb: { r, g, b, a } }: any) =>
    this.props.onChange([r, g, b].map((c) => c / 255).concat(a));
  render() {
    let [r, g, b, a] = this.props.value || [];
    r = Math.floor((r || 0) * 255);
    g = Math.floor((g || 0) * 255);
    b = Math.floor((b || 0) * 255);
    const Component = this.props.compact ? CompactPicker : SliderPicker;
    return <Component color={{ r, g, b, a }} onChange={this.onChange} />;
  }
}
