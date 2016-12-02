//@flow
import React, {
  Component,
} from "react";
import {GLSL, Node, Shaders} from "gl-react";
import {Surface} from "gl-react-native";

const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
    `
  }
});

export default class GLExample1 extends Component {
  render () {
    return (
      <Surface width={100} height={100}>
        <Node shader={shaders.helloGL} />
      </Surface>
    );
  }
}
