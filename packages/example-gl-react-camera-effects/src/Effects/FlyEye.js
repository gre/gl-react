//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  FlyEye: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float value;
void main () {
  gl_FragColor = texture2D(
    t,
    uv + vec2(
      0.01 * sin(uv.x * value * 200.0),
      0.01 * sin(uv.y * value * 200.0)
    )
  );
}`,
  },
});

export default class FlyEye extends Component {
  props: {
    value: number,
    children?: *,
  };
  render() {
    const { children: t, value } = this.props;
    return <Node shader={shaders.FlyEye} uniforms={{ t, value }} />;
  }
}
