//@flow
import React, { Component } from "react";
import { Bus, Backbuffer, Node, Shaders, GLSL } from "gl-react";
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
void main () {
  vec3 webcamC = texture2D(webcam, uv).rgb;
  gl_FragColor = vec4(
    vec3(1.0) * texture2D(gol, uv).r +
    webcamC * mix(step(0.5, webcamC.r), 0.9, 0.2),
  1.0);
}
    `,
  },
});

const Display = ({ gol, webcam }) =>
  <Node
    shader={extraShaders.Display}
    uniformsOptions={{ gol: { interpolation: "nearest" } }}
    uniforms={{ gol, webcam }}
  />;

const GameOfLife = ({ size, reset, resetTexture }) =>
  <Node
    shader={shaders.GameOfLife}
    width={size}
    height={size}
    backbuffering
    sync
    uniforms={{
      t: reset ? resetTexture : Backbuffer,
      size,
    }}
  />;

const GameOfLifeLoop = timeLoop(GameOfLife, {
  refreshRate: 4
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
      onMouseUp={this.onMouseUp}>

      <Bus ref="webcam">{ redraw =>
        <Video onFrame={redraw} autoPlay>
          <WebCamSource />
        </Video>
      }</Bus>

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
    this.setState({ reset: true, size: Math.floor(10 + 200*Math.random()*Math.random()) });
  onMouseUp = () =>
    this.setState({ reset: false });
}
