module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Motion, spring } from "react-motion";

const shaders = Shaders.create({
  Heart: {
    // inspired from http://glslsandbox.com/e#29521.0
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform vec3 color;
uniform float over, toggle;
void main() {
  float scale = 1.0 - 0.1 * over - 0.8 * toggle;
  vec2 offset = vec2(0.0, -0.3 - 0.1 * over - 0.7 * toggle);
  vec2 p = scale * (2.0 * uv - 1.0 + offset);
  float a = atan(p.x, p.y) / ${Math.PI /* \\o/ */};
  float r = length(p);
  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h - 0.3 * (1.0-over))/(6.0-5.0*h);
  float f = step(r,d) * pow(max(1.0-r/d, 0.0),0.25);
  vec3 t = texture2D(image, uv).rgb;
  vec3 c = mix(color * (1.0 + 0.6 * t), t, min(0.8 * over + toggle, 1.0));
  gl_FragColor = vec4(mix(vec3(1.0), c, f), 1.0);
}\`,
  },
});

class InteractiveHeart extends Component {
  state = { over: 0, toggle: 0 };
  onMouseEnter = () => this.setState({ over: 1 });
  onMouseLeave = () => this.setState({ over: 0 });
  onClick = () => this.setState({ toggle: this.state.toggle ? 0 : 1 });
  render() {
    const { color, image } = this.props;
    const { over, toggle } = this.state;
    return (
      <Surface
        width={300}
        height={300}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <Motion
          defaultStyle={{ over, toggle }}
          style={{
            over: spring(over, [150, 15]),
            toggle: spring(toggle, [150, 15]),
          }}
        >
          {({ over, toggle }) => (
            <Node
              shader={shaders.Heart}
              uniforms={{ color, image, over, toggle }}
            />
          )}
        </Motion>
      </Surface>
    );
  }
}

export default () => (
  <InteractiveHeart color={[1, 0, 0]} image="https://i.imgur.com/GQo1KWq.jpg" />
);
`
