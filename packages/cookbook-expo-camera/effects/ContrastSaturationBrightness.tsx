import React from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  ContrastSaturationBrightness: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast;
uniform float saturation;
uniform float brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main () {
  vec4 c = texture2D(t, uv);
  vec3 brt = c.rgb * brightness;
  gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}`,
  },
});

export default function ContrastSaturationBrightness({
  contrast = 1,
  saturation = 1,
  brightness = 1,
  children: t,
}: {
  contrast?: number;
  saturation?: number;
  brightness?: number;
  children: any;
}) {
  return (
    <Node
      shader={shaders.ContrastSaturationBrightness}
      uniforms={{ t, contrast, saturation, brightness }}
    />
  );
}
