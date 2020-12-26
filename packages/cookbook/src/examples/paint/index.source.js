module.exports=`import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

function getPosition(e) {
  const rect = e.target.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
}

const shaders = Shaders.create({
  paint: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
} \`,
  },
});

export default class Example extends Component {
  state = {
    drawing: false,
    color: [1, 0, 0, 1],
    center: [0.5, 0.5],
    brushRadius: 0.04,
  };

  render() {
    return (
      <Surface
        width={500}
        height={500}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        webglContextAttributes={{ preserveDrawingBuffer: true }}
        style={{ cursor: "crosshair" }}
      >
        <Node shader={shaders.paint} uniforms={this.state} clear={null} />
      </Surface>
    );
    // NB: We also need to explicitely use clear=null
    // to disable the Node to clear the framebuffer,
    // and enable preserveDrawingBuffer webgl options.
  }

  onMouseLeave = () => {
    this.setState({ drawing: false });
  };
  onMouseMove = (e) => {
    if (this.state.drawing) {
      this.setState({
        center: getPosition(e),
        brushRadius: 0.03 + 0.01 * Math.cos(Date.now() / 1000),
      });
    }
  };
  onMouseDown = (e) => {
    this.setState({
      drawing: true,
      center: getPosition(e),
      color: [Math.random(), Math.random(), Math.random(), 1],
    });
  };
  onMouseUp = () => {
    this.setState({
      drawing: false,
    });
  };
}
`
