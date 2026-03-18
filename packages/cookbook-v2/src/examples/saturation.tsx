import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  Saturate: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast, saturation, brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main() {
  vec4 c = texture2D(t, uv);
  vec3 brt = c.rgb * brightness;
  gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}`,
  },
});

export const Saturate = ({
  contrast,
  saturation,
  brightness,
  children,
}: {
  contrast: number;
  saturation: number;
  brightness: number;
  children: any;
}) => (
  <Node
    shader={shaders.Saturate}
    uniforms={{ contrast, saturation, brightness, t: children }}
  />
);

export default function SaturationExample({
  contrast = 1,
  saturation = 1,
  brightness = 1,
}: {
  contrast?: number;
  saturation?: number;
  brightness?: number;
}) {
  return (
    <Surface width={480} height={300}>
      <Saturate contrast={contrast} saturation={saturation} brightness={brightness}>
        {"https://i.imgur.com/uTP9Xfr.jpg"}
      </Saturate>
    </Surface>
  );
}
