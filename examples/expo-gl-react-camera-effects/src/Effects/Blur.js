//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders, connectSize } from "gl-react";

const shaders = Shaders.create({
  blur1D: {
    // blur9: from https://github.com/Jam3/glsl-fast-gaussian-blur
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
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
void main () {
  gl_FragColor = blur9(t, uv, resolution, direction);
}`,
  },
});

const Blur1D = ({ width, height, pixelRatio, direction, children: t }) => (
  <Node
    shader={shaders.blur1D}
    width={width}
    height={height}
    pixelRatio={pixelRatio}
    uniforms={{
      direction,
      resolution: [width, height],
      t,
    }}
  />
);

const NORM = Math.sqrt(2) / 2;

function directionForPass(p, factor, total) {
  const f = (factor * 2 * Math.ceil(p / 2)) / total;
  switch (
    (p - 1) %
    4 // alternate horizontal, vertical and 2 diagonals
  ) {
    case 0:
      return [f, 0];
    case 1:
      return [0, f];
    case 2:
      return [f * NORM, f * NORM];
    case 3:
      return [f * NORM, -f * NORM];
  }
}

export default connectSize(
  class Blur extends Component {
    props: {
      factor: number,
      children?: any,
      passes: number,
      width: any,
      height: any,
      pixelRatio: number,
    };

    static defaultProps = {
      passes: 2,
    };

    render() {
      const {
        width,
        height,
        pixelRatio,
        factor,
        children,
        passes,
      } = this.props;
      const rec = (pass) =>
        pass <= 0 ? (
          children
        ) : (
          <Blur1D
            width={width}
            height={height}
            pixelRatio={pixelRatio}
            direction={directionForPass(pass, factor, passes)}
          >
            {rec(pass - 1)}
          </Blur1D>
        );
      return rec(passes);
    }
  }
);
