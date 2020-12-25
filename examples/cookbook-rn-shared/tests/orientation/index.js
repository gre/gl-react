//@flow
import React, { Component } from "react";
import { View, Text } from "react-native";
import { LinearCopy, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import { images } from "./meta";

export default class Test extends Component {
  static defaultProps = {
    image: images[0],
  };
  render() {
    const { width, image } = this.props;
    return (
      <Surface style={{ width, height: width * 0.75 }}>
        <LinearCopy>{image}</LinearCopy>
      </Surface>
    );
  }
}
