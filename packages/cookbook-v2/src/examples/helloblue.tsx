import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  helloBlue: {
    frag: GLSL`#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform float blue; // a uniform: a value sent from JS (React props) to the GPU
void main() {
  color = vec4(uv.x, uv.y, blue, 1.0); // uv.x->red, uv.y->green, blue uniform->blue
}`,
  },
});

// uniforms maps JS values to GLSL uniform variables by name
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
