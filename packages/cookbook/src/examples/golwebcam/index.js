//@flow
import React, { Component } from "react";
import { Bus, Uniform, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { WebCamSource } from "../webcam";
import { shaders } from "../gol";
import timeLoop from "../../HOC/timeLoop";

const extraShaders = Shaders.create({
  Display: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D gol, webcam;
uniform float webcamRatio;
void main () {
  vec2 aspect = vec2(max(1.0, 1.0/webcamRatio), max(1.0, webcamRatio));
  vec2 p = uv * aspect + (1.0 - aspect) / 2.0;
  if (0.0>p.x||1.0<p.x||0.0>p.y||1.0<p.y) {
    gl_FragColor = vec4(0.0);
  }
  else {
    vec3 webcamC = texture2D(webcam, p).rgb;
    gl_FragColor = vec4(
      vec3(1.0) * texture2D(gol, p).r +
      webcamC * mix(step(0.5, webcamC.r), 0.9, 0.2),
    1.0);
  }
}
    `,
  },
});

const Display = ({ gol, webcam }) => (
  <Node
    shader={extraShaders.Display}
    uniformsOptions={{ gol: { interpolation: "nearest" } }}
    uniforms={{
      gol,
      webcam,
      webcamRatio: Uniform.textureSizeRatio(webcam),
    }}
  />
);

const GameOfLife = ({ size, reset, resetTexture }) => (
  <Node
    shader={shaders.GameOfLife}
    width={size}
    height={size}
    backbuffering
    sync
    uniforms={{
      t: reset ? resetTexture : Uniform.Backbuffer,
      size,
    }}
  />
);

const GameOfLifeLoop = timeLoop(GameOfLife, {
  refreshRate: 4,
});

export default class Example extends Component {
  state = { reset: false, size: 32 };
  render() {
    const { reset, size } = this.state;
    return (
      <Surface
        style={{ cursor: "pointer" }}
        width={400}
        height={400}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
      >
        <Bus ref="webcam">
          {(redraw) => (
            <Video onFrame={redraw} autoPlay>
              <WebCamSource />
            </Video>
          )}
        </Bus>

        <Display
          gol={
            <GameOfLifeLoop
              reset={reset}
              size={size}
              resetTexture={() => this.refs.webcam}
            />
          }
          webcam={() => this.refs.webcam}
        />
      </Surface>
    );
  }
  onMouseDown = () =>
    this.setState({
      reset: true,
      size: Math.floor(10 + 200 * Math.random() * Math.random()),
    });
  onMouseUp = () => this.setState({ reset: false });
}
