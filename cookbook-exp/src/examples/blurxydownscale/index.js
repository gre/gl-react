//@flow
import React, { Component } from "react";
import {LinearCopy} from "gl-react";
import { Surface } from "gl-react-exponent";
import {BlurXY} from "../blurxy";

export default class Example extends Component {
  render() {
    const { factor, width } = this.props;
    return (
      <Surface width={width} height={width*300/400}>
        <LinearCopy>
          <BlurXY factor={factor} width={100} height={75}>
            {require("../../iPKTONG.jpg")}
          </BlurXY>
        </LinearCopy>
      </Surface>
// we have to wrap this in a <LinearCopy> so it upscales to the Surface size.
    );
  }
  static defaultProps = {
    factor: 0.5,
  };
}
