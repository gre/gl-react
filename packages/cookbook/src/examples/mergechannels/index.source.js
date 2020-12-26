module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

import red from "./img1.png";
import green from "./img2.png";
import blue from "./img3.png";

const shaders = Shaders.create({
  mergeChannels: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform sampler2D channels[3];
float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}
void main() {
  gl_FragColor = vec4(
    monochrome(texture2D(channels[0], uv).rgb),
    monochrome(texture2D(channels[1], uv).rgb),
    monochrome(texture2D(channels[2], uv).rgb),
    1.0
  );
}\`,
  },
});

export class MergeChannels extends Component {
  render() {
    const { red, green, blue } = this.props;
    return (
      <Node
        shader={shaders.mergeChannels}
        uniforms={{
          channels: [red, green, blue],
        }}
      />
    );
  }
}

export default class Example extends Component {
  render() {
    const { red, green, blue } = this.props;
    return (
      <Surface width={400} height={400}>
        <MergeChannels red={red} green={green} blue={blue} />
      </Surface>
    );
  }

  static defaultProps = {
    red,
    green,
    blue,
  };
}
`
