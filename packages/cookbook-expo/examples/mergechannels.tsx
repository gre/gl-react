import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";

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
    uniforms={{ channels: [red, green, blue] }}
  />
);

const img1 = require("../assets/imgs/img1.png");
const img2 = require("../assets/imgs/img2.png");
const img3 = require("../assets/imgs/img3.png");

export default function MergeChannelsExample() {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <MergeChannels red={img1} green={img2} blue={img3} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 320, height: 320 },
});
