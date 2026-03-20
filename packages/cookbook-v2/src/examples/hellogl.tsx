import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

// Shaders must be statically created (compiled once on GPU)
const shaders = Shaders.create({
  helloGL: {
    // fragment shader in GLSL — runs on GPU for EACH pixel
    frag: GLSL`#version 300 es
precision highp float;
in vec2 uv; // uv.x and uv.y vary from 0.0 to 1.0
out vec4 color;
void main() {
  color = vec4(uv.x, uv.y, 0.5, 1.0); // output pixel color as vec4(r,g,b,a)
}`,
  },
});

export default function HelloGL() {
  return (
    // Surface creates the WebGL canvas. Node runs the shader.
    <Surface width={300} height={300}>
      <Node shader={shaders.helloGL} />
    </Surface>
  );
}
