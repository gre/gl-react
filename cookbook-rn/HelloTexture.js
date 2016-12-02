//@flow
import React, {
  Component,
} from "react";
import {GLSL, Node, Shaders} from "gl-react";
import {Surface} from "gl-react-native";

const shaders = Shaders.create({
  helloTexture: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = texture2D(t, uv);
}
    `
  }
});

export default class GLExample1 extends Component {
  render () {
    return (
      <Surface width={100} height={100}>
        <Node
          shader={shaders.helloTexture}
          uniforms={{
            t: require("./5EOyTDQ.jpg"),
          }}
        />
      </Surface>
    );
  }
}
