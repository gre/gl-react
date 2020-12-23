//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import Animated from "animated";
const shaders = Shaders.create({
  cursor: {
    frag: GLSL`
precision lowp float; varying vec2 uv; uniform vec2 style;
void main() {
  float dist = pow(1.0 - distance(style, uv), 8.0);
  gl_FragColor = vec4(smoothstep(2.0, 0.2, distance(style, uv)) * vec3(
    1.0 * dist + pow(1.0 - distance(style.y, uv.y), 16.0),
    0.5 * dist + pow(1.0 - distance(style.y, uv.y), 32.0),
    0.2 * dist + pow(1.0 - distance(style.x, uv.x), 32.0)), 1.0);
}`,
  },
});
class Cursor extends Component {
  render() {
    const {
      style: { x, y },
    } = this.props;
    return <Node shader={shaders.cursor} uniforms={{ style: [x, y] }} />;
  }
}
// using "style" is a hack. see https://github.com/animatedjs/animated/issues/45
const AnimatedCursor = Animated.createAnimatedComponent(Cursor);

export default class Example extends Component {
  state = {
    style: new Animated.ValueXY({ x: 0.5, y: 0.5 }),
  };
  onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    Animated.spring(this.state.style, {
      toValue: {
        x: (e.clientX - rect.left) / rect.width,
        y: (rect.bottom - e.clientY) / rect.height,
      },
    }).start();
  };
  render() {
    return (
      <Surface width={500} height={500} onMouseMove={this.onMouseMove}>
        <AnimatedCursor {...this.state} />
      </Surface>
    );
  }
}
