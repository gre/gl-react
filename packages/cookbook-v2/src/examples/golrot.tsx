import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";
import { GameOfLife } from "./gol";

const shaders = Shaders.create({
  Rotating: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float angle, scale;
uniform sampler2D children;
void main() {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - vec2(0.5)) * rotation / scale + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.0)
    : texture2D(children, p);
}`,
  },
});

export const Rotating = ({
  angle,
  scale,
  children,
}: {
  angle: number;
  scale: number;
  children: any;
}) => (
  <Node
    shader={shaders.Rotating}
    uniformsOptions={{ children: { interpolation: "nearest" } }}
    uniforms={{ angle, scale, children }}
  />
);

export default function GOLRot() {
  const { time } = useTimeLoop();
  const golTick = Math.floor(time / 200);

  return (
    <Surface width={500} height={500}>
      <Rotating
        angle={(time / 1000) % (2 * Math.PI)}
        scale={0.6 + 0.15 * Math.cos(time / 500)}
      >
        <GameOfLife tick={golTick} />
      </Rotating>
    </Surface>
  );
}
