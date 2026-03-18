import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  helloBlue: {
    frag: GLSL`#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform float blue;
void main() {
  color = vec4(uv.x, uv.y, blue, 1.0);
}`,
  },
});

export const HelloBlue = ({ blue }: { blue: number }) => (
  <Node shader={shaders.helloBlue} uniforms={{ blue }} />
);

export default function HelloBlueExample({ blue = 0.5 }: { blue?: number }) {
  return (
    <Surface width={300} height={300}>
      <HelloBlue blue={blue} />
    </Surface>
  );
}
