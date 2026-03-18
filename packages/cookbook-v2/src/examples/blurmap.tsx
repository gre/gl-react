import React from "react";
import { Shaders, Node, GLSL, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";

const NORM = Math.sqrt(2) / 2;

const directionForPass = (
  p: number,
  factor: number,
  total: number
): [number, number] => {
  const f = (factor * 2 * Math.ceil(p / 2)) / total;
  switch ((p - 1) % 4) {
    case 0:
      return [f, 0];
    case 1:
      return [0, f];
    case 2:
      return [f * NORM, f * NORM];
    default:
      return [f * NORM, -f * NORM];
  }
};

const shaders = Shaders.create({
  blurV1D: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t, map;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction * texture2D(map, uv).rg);
}`,
  },
});

export const BlurV1D = connectSize(
  ({
    children: t,
    direction,
    map,
    width,
    height,
  }: {
    children: any;
    direction: [number, number];
    map: any;
    width: number;
    height: number;
  }) => (
    <Node
      shader={shaders.blurV1D}
      uniforms={{ t, map, resolution: [width, height], direction }}
    />
  )
);

export const BlurV = connectSize(
  ({
    children,
    factor,
    map,
    passes,
  }: {
    children: any;
    factor: number;
    map: any;
    passes: number;
  }) => {
    const rec = (pass: number): any =>
      pass <= 0 ? (
        children
      ) : (
        <BlurV1D map={map} direction={directionForPass(pass, factor, passes)}>
          {rec(pass - 1)}
        </BlurV1D>
      );
    return rec(passes);
  }
);

const blurMapImages = [
  "https://i.imgur.com/SzbbUvX.png",
  "https://i.imgur.com/0PkQEk1.png",
  "https://i.imgur.com/z2CQHpg.png",
  "https://i.imgur.com/k9Eview.png",
  "https://i.imgur.com/wh0On3P.png",
];

export default function BlurMapExample({
  factor = 2,
  passes = 4,
  map = blurMapImages[0],
}: {
  factor?: number;
  passes?: number;
  map?: string;
}) {
  return (
    <Surface width={600} height={284}>
      <BlurV map={map} passes={passes} factor={factor}>
        {"https://i.imgur.com/NjbLHx2.jpg"}
      </BlurV>
    </Surface>
  );
}
