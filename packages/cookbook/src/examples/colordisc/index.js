//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
const shaders = Shaders.create({
  ColoredDisc: {
    // NB: if you omit to define a #version, you are using WebGL1 which is using ES 1.0.
    // In that version, things differ a bit: varying, gl_FragColor,...
    // gl-react is retrocompatible with this version
    // Many of our next examples are written in WebGL1 (historical reasons)
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec3 fromColor, toColor;
void main() {
  float d = 2.0 * distance(uv, vec2(0.5));
  gl_FragColor = mix(
    vec4(mix(fromColor, toColor, d), 1.0),
    vec4(0.0),
    step(1.0, d)
  );
}`,
  },
});

class ColoredDisc extends Component {
  render() {
    // fromColor/toColor must be array of 3 numbers because defined as vec3 type.
    const { fromColor, toColor } = this.props;
    return (
      <Node shader={shaders.ColoredDisc} uniforms={{ fromColor, toColor }} />
    );
  }
}

export default class Example extends Component {
  render() {
    const { fromColor, toColor } = this.props;
    return (
      <Surface width={300} height={300}>
        <ColoredDisc fromColor={fromColor} toColor={toColor} />
      </Surface>
    );
  }
  static defaultProps = {
    fromColor: [1, 0, 1],
    toColor: [1, 1, 0],
  };
}
