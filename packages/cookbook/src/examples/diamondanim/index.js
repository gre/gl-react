//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
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

export default () => (
  <Surface width={300} height={300}>
    <DiamondCrop>
      <HelloGLAnimated blue={0.8} />
    </DiamondCrop>
  </Surface>
);
