module.exports=`//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  squareTunnel: {
    // from https://en.wikipedia.org/wiki/Shadertoy
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float iGlobalTime;
void main() {
  vec2 p = 2.0 * uv - vec2(1.0);
  float a = atan(p.y,p.x);
  float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );
  vec2 uv = vec2( 1.0/r + 0.2*iGlobalTime, a );
  float f = cos(12.0*uv.x)*cos(6.0*uv.y);
  vec3 col = 0.5 + 0.5*sin( 3.1416*f + vec3(0.0,0.5,1.0) );
  col = col*r;
  gl_FragColor = vec4( col, 1.0 );
}\`,
  },
});

const SquareTunnel = ({ time }) => (
  <Node shader={shaders.squareTunnel} uniforms={{ iGlobalTime: time / 1000 }} />
);

const DesertPassageLoop = timeLoop(SquareTunnel);

export default () => (
  <Surface width={400} height={400}>
    <DesertPassageLoop />
  </Surface>
);
`
