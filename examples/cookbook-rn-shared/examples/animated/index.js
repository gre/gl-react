//@flow
import React, { Component } from "react";
import { Animated, PanResponder, View } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

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

export default respondToTouchPosition(
  class Example extends Component {
    props: {
      touchPosition: {
        x: number,
        y: number,
      },
    };
    state = {
      style: new Animated.ValueXY(this.props.touchPosition),
    };
    componentWillReceiveProps({ touchPosition }) {
      if (this.props.touchPosition !== touchPosition) {
        Animated.spring(this.state.style, {
          toValue: touchPosition,
        }).start();
      }
    }
    render() {
      const { width, height } = this.props;
      return (
        <Surface style={{ width, height }}>
          <AnimatedCursor {...this.state} />
        </Surface>
      );
    }
  }
);
