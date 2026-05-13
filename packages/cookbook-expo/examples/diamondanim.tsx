import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { DiamondCrop } from "./diamondcrop";
import { useTimeLoop } from "../shared/useTimeLoop";

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
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <DiamondCrop>
          <Node
            shader={shaders.helloRed}
            uniforms={{ red: Math.cos(time / 100) }}
          />
        </DiamondCrop>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 300, height: 300 },
});
