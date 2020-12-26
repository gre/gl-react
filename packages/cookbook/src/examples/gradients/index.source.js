module.exports=`//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  gradients: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec4 colors[3];
uniform vec2 particles[3];
void main () {
  vec4 sum = vec4(0.0);
  for (int i=0; i<3; i++) {
    vec4 c = colors[i];
    vec2 p = particles[i];
    float d = c.a * smoothstep(0.6, 0.2, distance(p, uv));
    sum += d * vec4(c.a * c.rgb, c.a);
  }
  if (sum.a > 1.0) {
    sum.rgb /= sum.a;
    sum.a = 1.0;
  }
  gl_FragColor = vec4(sum.a * sum.rgb, 1.0);
}\`,
  },
});

// Alternative syntax using React stateless function component
const Gradients = ({ time }) => (
  <Node
    shader={shaders.gradients}
    uniforms={{
      colors: [
        [Math.cos(0.002 * time), Math.sin(0.002 * time), 0.2, 1],
        [Math.sin(0.002 * time), -Math.cos(0.002 * time), 0.1, 1],
        [0.3, Math.sin(3 + 0.002 * time), Math.cos(1 + 0.003 * time), 1],
      ],
      particles: [
        [0.3, 0.3],
        [0.7, 0.5],
        [0.4, 0.9],
      ],
    }}
  />
);

const GradientsLoop = timeLoop(Gradients);

export default () => (
  <Surface width={300} height={300}>
    <GradientsLoop />
  </Surface>
);

// NB: don't abuse the uniforms array:
// it's not meant to be used with lot of objects.
// GLSL 1 also don't support variable length in loops.
`
