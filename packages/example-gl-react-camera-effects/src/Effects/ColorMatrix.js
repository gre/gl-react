//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  ColorMatrix: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform mat4 m;
void main () {
  gl_FragColor = m * texture2D(t, uv);
}`,
  },
});

export default class ColorMatrix extends Component {
  props: {
    matrix: Array<number>,
    children?: *,
  };
  render() {
    const { children: t, matrix } = this.props;
    return <Node shader={shaders.ColorMatrix} uniforms={{ t, m: matrix }} />;
  }
}
