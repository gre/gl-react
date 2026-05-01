import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { BlurV } from "./blurmap";
import { useTimeLoop } from "../shared/useTimeLoop";

const shaders = Shaders.create({
  ConicalGradiant: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform float phase;
const float PI = 3.14159;
void main () {
  gl_FragColor = vec4(vec3(
    mod(phase + atan(uv.x-0.5, uv.y-0.5)/(2.0*PI), 1.0)
  ), 1.0);
}`,
  },
});

function ConicalGradiantLoop() {
  const { time } = useTimeLoop();
  return (
    <Node shader={shaders.ConicalGradiant} uniforms={{ phase: time / 3000 }} />
  );
}

export default function BlurMapDyn({
  factor = 6,
  passes = 4,
}: {
  factor?: number;
  passes?: number;
}) {
  const blurMapBus = useRef<any>(null);
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <Bus ref={blurMapBus}>
          <ConicalGradiantLoop />
        </Bus>
        <BlurV map={() => blurMapBus.current} passes={passes} factor={factor}>
          {{ uri: "https://i.imgur.com/NjbLHx2.jpg" }}
        </BlurV>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 170 },
});
