//@flow
import React, { PureComponent, Component } from "react";
import { Shaders, Node, GLSL, LinearCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  animated: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float time, amp, freq, colorSeparation, moving;
vec2 lookup (vec2 offset) {
  return mod(
    uv + amp * vec2(
        cos(freq*(uv.x+offset.x)+time/1000.0),
        sin(freq*(uv.y+offset.x)+time/1000.0))
      + vec2( moving * time/10000.0, 0.0),
    vec2(1.0));
}
void main() {
  vec3 col =  mix(vec3(
    texture2D(t, lookup(vec2(colorSeparation))).r,
    texture2D(t, lookup(vec2(-colorSeparation))).g,
    texture2D(t, lookup(vec2(0.0))).b),  vec3(1.0), 0.1);
  gl_FragColor = vec4(col * vec3(
    0.5 + 0.5 * cos(uv.y + uv.x * 49.0),
    0.6 * uv.x + 0.2 * sin(uv.y * 30.0),
    1.0 - uv.x + 0.5 * cos(uv.y * 2.0)
  ), 1.0);
}`,
  },
});

class Animated extends Component {
  render() {
    const { children: t, time } = this.props;
    return (
      <Node
        shader={shaders.animated}
        uniforms={{
          t,
          time,
          freq: 20 - 14 * Math.sin(time / 7000),
          amp: 0.05 * (1 - Math.cos(time / 4000)),
          colorSeparation: 0.02,
          moving: 1,
        }}
      />
    );
  }
}

const AnimatedLoop = timeLoop(Animated);

const size = { width: 500, height: 200 };
const font = "36px bold Helvetica";
const lineHeight = 40;
const padding = 10;

class Text extends PureComponent {
  render() {
    const { text } = this.props;
    return (
      // Text is a PureComponent that renders a LinearCopy
      // that will cache the canvas content for more efficiency
      <LinearCopy>
        <JSON2D {...size}>
          {{
            background: "#000",
            size: [size.width, size.height],
            draws: [
              {
                textBaseline: "top",
                fillStyle: "#fff",
                font,
              },
              ["fillText", text, padding, padding, lineHeight],
            ],
          }}
        </JSON2D>
      </LinearCopy>
    );
  }
}

export default class Example extends Component {
  render() {
    const { text } = this.props;
    return (
      <Surface {...size}>
        <AnimatedLoop>
          <Text text={text} />
        </AnimatedLoop>
      </Surface>
    );
  }

  static defaultProps = {
    text: "Hello world\n2d canvas text\ninjected as texture",
  };
}

export { size, font, lineHeight, padding };
