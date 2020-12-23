//@flow
import React, { Component } from "react";
import { Uniform, LinearCopy, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { WebCamSource } from "../webcam";

const shaders = Shaders.create({
  Persistence: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t, back;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(t, uv),
    texture2D(back, uv+vec2(0.0, 0.005)),
    persistence
  ).rgb, 1.0);
}`,
  },
});

const Persistence = ({ children: t, persistence }) => (
  <Node
    shader={shaders.Persistence}
    backbuffering
    uniforms={{ t, back: Uniform.Backbuffer, persistence }}
  />
);

export default class Example extends Component {
  render() {
    const { persistence } = this.props;
    return (
      <Surface width={400} height={300}>
        <LinearCopy>
          <Persistence persistence={persistence}>
            {(redraw) => (
              <Video onFrame={redraw} autoPlay>
                <WebCamSource />
              </Video>
            )}
          </Persistence>
        </LinearCopy>
      </Surface>
    );
  }
  static defaultProps = {
    persistence: 0.8,
  };
}
