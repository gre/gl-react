import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

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

export const ColoredDisc = ({ fromColor, toColor }: { fromColor: number[]; toColor: number[] }) => (
  <Node shader={shaders.ColoredDisc} uniforms={{ fromColor, toColor }} />
);

export default function ColorDiscExample({
  fromColor = [1, 0, 1],
  toColor = [1, 1, 0],
}: {
  fromColor?: number[];
  toColor?: number[];
}) {
  return (
    <Surface width={300} height={300}>
      <ColoredDisc fromColor={fromColor} toColor={toColor} />
    </Surface>
  );
}
