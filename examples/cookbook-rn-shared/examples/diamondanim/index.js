//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import { DiamondCrop } from "../diamondcrop";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  helloRed: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float red;
void main() {
  gl_FragColor = vec4(red, uv.x, uv.y, 1.0);
}`,
  },
});

const HelloGLAnimated = timeLoop(({ time }) => (
  <Node shader={shaders.helloRed} uniforms={{ red: Math.cos(time / 100) }} />
));

export default ({ width }) => (
  <Surface style={{ width, height: width }}>
    <DiamondCrop>
      <HelloGLAnimated blue={0.8} />
    </DiamondCrop>
  </Surface>
);
