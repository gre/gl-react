module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

// gl-react allows to statically define "shaders":
const shaders = Shaders.create({
  helloGL: {
    // our first fragment shader in GLSL language (OpenGL Shading Language)
    // it gets compiled and run on the GPU
    frag: GLSL\`#version 300 es
precision highp float;

in vec2 uv; // input "uv" vec2 where x and y moves from 0.0 to 1.0 range
out vec4 color; // output the pixel color using the vec4(r,g,b,a) format

void main() { // the main() function is called FOR EACH PIXELS
  color = vec4(uv.x, uv.y, 0.5, 1.0);
}\`,
    // see [-> GLSL ES Specification <-](https://www.khronos.org/registry/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf)
  },
});

export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <Node shader={shaders.helloGL} />
      </Surface>
    );
    // Surface creates the canvas, an area of pixels where you can draw.
    // Node instanciates a "shader program" with the fragment shader defined above.
  }
}
`
