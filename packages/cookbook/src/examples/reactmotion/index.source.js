module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Motion, spring } from "react-motion";

const shaders = Shaders.create({
  cursor: {
    frag: GLSL\`
precision mediump float;
varying vec2 uv;
uniform vec2 mouse;
void main() {
  float dist = pow(1.0 - distance(mouse, uv), 8.0);
  float edgeDistX = pow(1.0 - distance(mouse.x, uv.x), 32.0);
  float edgeDistY = pow(1.0 - distance(mouse.y, uv.y), 32.0);
  gl_FragColor = vec4(vec3(
    0.8 * dist + edgeDistX,
    0.7 * dist + edgeDistY,
    0.6 * dist) * smoothstep(1.0, 0.2, distance(mouse, uv)),
    1.0);
}\`,
  },
});

const Cursor = ({ mouse }) => (
  <Motion
    defaultStyle={mouse}
    style={{ x: spring(mouse.x), y: spring(mouse.y) }}
  >
    {({ x, y }) => (
      <Node shader={shaders.cursor} uniforms={{ mouse: [x, y] }} />
    )}
  </Motion>
);

export default class Example extends Component {
  state = {
    mouse: { x: 0.5, y: 0.5 },
  };

  render() {
    return (
      <Surface width={600} height={600} onMouseMove={this.onMouseMove}>
        <Cursor {...this.state} />
      </Surface>
    );
  }

  onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    this.setState({
      mouse: {
        x: (e.clientX - rect.left) / rect.width,
        y: (rect.bottom - e.clientY) / rect.height,
      },
    });
  };
}
`
