//@flow
import React, { Component } from "react";
import { SliderPicker, CompactPicker } from "react-color";

export type Vec3 = [number, number, number];

export default class Vec3ColorPicker extends Component {
  props: {
    compact?: boolean,
    value: Vec3,
    onChange: (c: Vec3) => any,
  };
  onChange = ({ rgb: { r, g, b } }: any) =>
    this.props.onChange([r, g, b].map((c) => c / 255));
  render() {
    let [r, g, b] = this.props.value || [];
    r = Math.floor((r || 0) * 255);
    g = Math.floor((g || 0) * 255);
    b = Math.floor((b || 0) * 255);
    const Component = this.props.compact ? CompactPicker : SliderPicker;
    return <Component color={{ r, g, b }} onChange={this.onChange} />;
  }
}
