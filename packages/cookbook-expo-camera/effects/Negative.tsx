import React from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  Negative: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float factor;
void main () {
  vec4 c = texture2D(t, uv);
  gl_FragColor = vec4(mix(c.rgb, 1.0 - c.rgb, factor), c.a);
}`,
  },
});

export default function Negative({
  factor = 1,
  children: t,
}: {
  factor?: number;
  children: any;
}) {
  return <Node shader={shaders.Negative} uniforms={{ t, factor }} />;
}
