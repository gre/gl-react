//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  DiamondCrop: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
gl_FragColor = mix(
  texture2D(t, uv),
  vec4(0.0),
  step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5))
);
}`,
  },
});

export const DiamondCrop = ({ children: t }) => (
  <Node shader={shaders.DiamondCrop} uniforms={{ t }} />
);

export default class Example extends Component {
  render() {
    const { width } = this.props;
    return (
      <Surface style={{ width, height: width }}>
        <DiamondCrop>{{ uri: "https://i.imgur.com/5EOyTDQ.jpg" }}</DiamondCrop>
      </Surface>
    );
  }
}
