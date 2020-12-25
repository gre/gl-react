import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import timeLoop from "../../HOC/timeLoop";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

const shaders = Shaders.create({
  vignetteColorSeparationDistortion: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 mouse;
uniform float time, amp, freq, moving;
vec2 lookup (vec2 offset, float amp2) {
  return mod(
    uv + amp2 * amp * vec2(
      cos(freq*(uv.x+offset.x)+time),
      sin(freq*(uv.y+offset.x)+time))
      + vec2(
        moving * time/10.0,
        0.0),
    vec2(1.0));
}
void main() {
  float dist = distance(uv, mouse);
  float amp2 = pow(1.0 - dist, 2.0);
  float colorSeparation = 0.02 * mix(amp2, 1.0, 0.5);
  vec2 orientation = vec2(1.0, 0.0);
  float a = (1.0-min(0.95, pow(1.8 * distance(uv, mouse), 4.0) +
  0.5 * pow(distance(fract(50.0 * uv.y), 0.5), 2.0)));
  gl_FragColor = vec4(a * vec3(
    texture2D(t, lookup(colorSeparation * orientation, amp2)).r,
    texture2D(t, lookup(-colorSeparation * orientation, amp2)).g,
    texture2D(t, lookup(vec2(0.0), amp2)).b),
    1.0);
}`,
  },
});

const Vignette = timeLoop(({ children: t, time, mouse }) => (
  <Node
    shader={shaders.vignetteColorSeparationDistortion}
    uniforms={{
      t,
      time: time / 1000, // seconds is better for float precision
      mouse,
      freq: 10 + 2 * Math.sin(0.0007 * time),
      amp: 0.05 + Math.max(0, 0.03 * Math.cos(0.001 * time)),
      moving: 0,
    }}
  />
));

export default respondToTouchPosition(
  class Example extends Component {
    props: { touchPosition: { x: number, y: number } };
    render() {
      const {
        touchPosition: { x, y },
        width,
      } = this.props;
      return (
        <Surface style={{ width, height: (width * 400) / 500 }}>
          <Vignette mouse={[x, y]}>
            {{ uri: "https://i.imgur.com/2VP5osy.jpg" }}
          </Vignette>
        </Surface>
      );
    }
  }
);
