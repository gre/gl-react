//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  mergeChannels: {
    frag: GLSL`precision highp float;
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
}`,
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
    const { red, green, blue, width } = this.props;
    return (
      <Surface style={{ width, height: width }}>
        <MergeChannels red={red} green={green} blue={blue} />
      </Surface>
    );
  }

  static defaultProps = {
    red: require("../../images/mergechannels-img1.png"),
    green: require("../../images/mergechannels-img2.png"),
    blue: require("../../images/mergechannels-img3.png"),
  };
}
