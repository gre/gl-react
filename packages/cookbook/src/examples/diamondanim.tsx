import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { DiamondCrop } from "./diamondcrop";
import { useTimeLoop } from "../hooks/useTimeLoop";

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

export default function DiamondAnim() {
  const { time } = useTimeLoop();
  return (
    <Surface width={300} height={300}>
      <DiamondCrop>
        <Node shader={shaders.helloRed} uniforms={{ red: Math.cos(time / 100) }} />
      </DiamondCrop>
    </Surface>
  );
}
