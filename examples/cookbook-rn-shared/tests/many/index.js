//@flow
import React, { Component } from "react";
import { View } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`,
  },
});

export default class Test extends Component {
  render() {
    const { width } = this.props;
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Array(64)
          .fill(null)
          .map(() => (
            <Surface style={{ width: 8, height: 8 }}>
              <Node shader={shaders.helloGL} />
            </Surface>
          ))}
      </View>
    );
  }
}
