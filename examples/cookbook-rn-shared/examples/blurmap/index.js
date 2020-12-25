//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, connectSize } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  blurV1D: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t, map;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction * texture2D(map, uv).rg);
}`,
  },
});

// Same concept than Blur1D except it takes one more prop:
// a map texture that tells the blur intensity for a given position.
export const BlurV1D = connectSize(
  ({ children: t, direction, map, width, height }) => (
    <Node
      shader={shaders.blurV1D}
      uniforms={{ t, map, resolution: [width, height], direction }}
    />
  )
);

// And its N-pass version
import { directionForPass } from "../blurmulti";
export const BlurV = connectSize(({ children, factor, map, passes }) => {
  const rec = (pass) =>
    pass <= 0 ? (
      children
    ) : (
      <BlurV1D map={map} direction={directionForPass(pass, factor, passes)}>
        {rec(pass - 1)}
      </BlurV1D>
    );
  return rec(passes);
});

export default class Example extends Component {
  render() {
    const { factor, passes, map, width } = this.props;
    return (
      <Surface style={{ width, height: (width * 284) / 600 }}>
        <BlurV map={map} passes={passes} factor={factor}>
          {{ uri: "https://i.imgur.com/NjbLHx2.jpg" }}
        </BlurV>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 2,
    passes: 4,
    map: StaticBlurMap.images[0],
  };
}
import StaticBlurMap from "../../toolbox/StaticBlurMap";
