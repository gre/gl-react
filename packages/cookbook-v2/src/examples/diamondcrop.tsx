import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  DiamondCrop: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  // Manhattan distance from center defines the diamond shape
  gl_FragColor = mix(
    texture2D(t, uv),
    vec4(0.0),
    step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5))
  );
}`,
  },
});

// gl-react maps children to the t uniform automatically
export const DiamondCrop = ({ children: t }: { children: any }) => (
  <Node shader={shaders.DiamondCrop} uniforms={{ t }} />
);

export default function DiamondCropExample() {
  return (
    <Surface width={300} height={300}>
      <DiamondCrop>{"https://i.imgur.com/5EOyTDQ.jpg"}</DiamondCrop>
    </Surface>
  );
}
