import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";

const shaders = Shaders.create({
  DiamondCrop: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = mix(
    texture2D(t, uv),
    vec4(0.0),
    step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5))
  );
}`,
  },
});

export const DiamondCrop = ({ children: t }: { children: any }) => (
  <Node shader={shaders.DiamondCrop} uniforms={{ t }} />
);

export default function DiamondCropExample() {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <DiamondCrop>{{ uri: "https://i.imgur.com/5EOyTDQ.jpg" }}</DiamondCrop>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 300, height: 300 },
});
