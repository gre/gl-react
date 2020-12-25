//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
const shaders = Shaders.create({
  ColoredDisc: {
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
    const { fromColor, toColor, width } = this.props;
    return (
      <Surface style={{ width, height: width }}>
        <ColoredDisc fromColor={fromColor} toColor={toColor} />
      </Surface>
    );
  }
  static defaultProps = {
    fromColor: [1, 0, 1],
    toColor: [1, 1, 0],
  };
}
