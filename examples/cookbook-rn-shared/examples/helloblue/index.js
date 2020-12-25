//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  helloBlue: {
    // uniforms are variables from JS. We pipe blue uniform into blue output color
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
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
    const { width } = this.props;
    return (
      <Surface style={{ width, height: width }}>
        <HelloBlue blue={this.props.blue} />
      </Surface>
    );
  }
  static defaultProps = { blue: 0.5 };
}
