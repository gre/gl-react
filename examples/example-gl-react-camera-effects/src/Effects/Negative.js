//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  Negative: {
    frag: GLSL`precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  uniform float factor;
  void main () {
    vec4 c = texture2D(t, uv);
    gl_FragColor = vec4(mix(c.rgb, 1.0 - c.rgb, factor), c.a);
  }`,
  },
});

export default class Negative extends Component {
  props: {
    factor: number,
    children?: *,
  };
  static defaultProps = {
    factor: 1,
  };
  render() {
    const { children: t, factor } = this.props;
    return <Node shader={shaders.Negative} uniforms={{ t, factor }} />;
  }
}
