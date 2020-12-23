//@flow
import React, { Component } from "react";
import { LinearCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurXY } from "../blurxy";

export default class Example extends Component {
  render() {
    const { factor } = this.props;
    return (
      <Surface width={400} height={300}>
        <LinearCopy>
          <BlurXY factor={factor} width={100} height={75}>
            https://i.imgur.com/iPKTONG.jpg
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
