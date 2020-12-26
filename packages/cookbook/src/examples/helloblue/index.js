//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  helloBlue: {
    // uniforms are variables from JS. We pipe blue uniform into blue output color
    frag: GLSL`#version 300 es
precision highp float;

in vec2 uv;
out vec4 color;

uniform float blue; // <- coming from JS

void main() {
  color = vec4(uv.x, uv.y, blue, 1.0);
}`,
  },
});

// We can make a <HelloBlue blue={0.5} /> that will render the concrete <Node/>
export class HelloBlue extends Component {
  render() {
    const { blue } = this.props;
    return <Node shader={shaders.helloBlue} uniforms={{ blue }} />;
  }
}

// Our example will pass the slider value to HelloBlue
export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <HelloBlue blue={this.props.blue} />
      </Surface>
    );
  }
  static defaultProps = { blue: 0.5 };
}
