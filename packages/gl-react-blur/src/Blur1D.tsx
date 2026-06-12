import React from "react";
import { Shaders, Node, GLSL, connectSize } from "gl-react";

const shaders = Shaders.create({
  blur1D: {
    // blur9: from https://github.com/Jam3/glsl-fast-gaussian-blur
    frag: GLSL`
precision highp float;
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
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction);
}`,
  },
});

export type Blur1DProps = {
  /** the content to blur: any gl-react texture input */
  children: any;
  /** blur direction & distance vector, in pixels */
  direction: [number, number];
  width?: number;
  height?: number;
};

// connectSize injects width/height for correct texel offset calculation
const Blur1D = connectSize(
  ({ children: t, direction, width, height }: any) => (
    <Node
      shader={shaders.blur1D}
      uniforms={{ t, resolution: [width, height], direction }}
    />
  )
) as React.ComponentType<Blur1DProps>;

export default Blur1D;
