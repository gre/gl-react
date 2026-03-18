import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
void main() {
  color = vec4(uv.x, uv.y, 0.5, 1.0);
}`,
  },
});

export default function HelloGL() {
  return (
    <Surface width={300} height={300}>
      <Node shader={shaders.helloGL} />
    </Surface>
  );
}
