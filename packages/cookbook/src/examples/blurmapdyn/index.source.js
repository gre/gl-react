module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurV } from "../blurmap";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  ConicalGradiant: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform float phase;
const float PI = 3.14159;
void main () {
  gl_FragColor = vec4(vec3(
    mod(phase + atan(uv.x-0.5, uv.y-0.5)/(2.0*PI), 1.0)
  ), 1.0);
}\`,
  },
});

const ConicalGradiantLoop = timeLoop(({ time }) => (
  <Node shader={shaders.ConicalGradiant} uniforms={{ phase: time / 3000 }} />
));

export default class Example extends Component {
  render() {
    const { factor, passes } = this.props;
    // <ConicalGradiant/> also needs to be computed once.
    return (
      <Surface width={600} height={284}>
        <Bus ref="blurMapBus">
          <ConicalGradiantLoop />
        </Bus>
        <BlurV map={() => this.refs.blurMapBus} passes={passes} factor={factor}>
          https://i.imgur.com/NjbLHx2.jpg
        </BlurV>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 6,
    passes: 4,
  };
}
`
