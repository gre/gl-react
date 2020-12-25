//@flow
import React, { Component } from "react";
import { View, Text } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  red: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`,
  },
  blue: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}`,
  },
});

export default class Test extends Component {
  render() {
    const { width } = this.props;
    return (
      <View
        style={{
          position: "relative",
          width,
          height: width,
          marginTop: 10,
        }}
      >
        <Surface
          style={{
            width: (2 * width) / 3,
            height: (2 * width) / 3,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <Node shader={shaders.red} />
        </Surface>
        <Surface
          style={{
            width: (2 * width) / 3,
            height: (2 * width) / 3,
            position: "absolute",
            top: width / 3,
            left: width / 3,
          }}
        >
          <Node shader={shaders.blue} />
        </Surface>
      </View>
    );
  }
}
