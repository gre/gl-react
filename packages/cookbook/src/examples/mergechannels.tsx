import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  mergeChannels: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D channels[3];
float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}
void main() {
  gl_FragColor = vec4(
    monochrome(texture2D(channels[0], uv).rgb),
    monochrome(texture2D(channels[1], uv).rgb),
    monochrome(texture2D(channels[2], uv).rgb),
    1.0
  );
}`,
  },
});

export const MergeChannels = ({
  red,
  green,
  blue,
}: {
  red: any;
  green: any;
  blue: any;
}) => (
  <Node
    shader={shaders.mergeChannels}
    uniforms={{
      channels: [red, green, blue],
    }}
  />
);

export default function MergeChannelsExample({
  red = "/assets/img1.png",
  green = "/assets/img2.png",
  blue = "/assets/img3.png",
}: {
  red?: string;
  green?: string;
  blue?: string;
}) {
  return (
    <Surface width={400} height={400}>
      <MergeChannels red={red} green={green} blue={blue} />
    </Surface>
  );
}
