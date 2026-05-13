import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { BlurV } from "./blurmap";
import { usePointerUV } from "../shared/useGLPosition";

const shaders = Shaders.create({
  Offset: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 offset;
void main () {
  gl_FragColor = texture2D(t, uv + offset);
}`,
  },
});

const Offset = ({ t, offset }: { t: any; offset: [number, number] }) => (
  <Node shader={shaders.Offset} uniforms={{ t, offset }} />
);

const W = 360;
const H = 170;

export default function BlurMapMouse() {
  const { uv, handlers } = usePointerUV(W, H, [0.5, 0.5]);
  const offset: [number, number] = [-(uv[0] - 0.5), -(uv[1] - 0.5)];
  const blurMapBus = useRef<any>(null);

  return (
    <View style={styles.center}>
      <View style={[styles.touch, { width: W, height: H }]} {...handlers}>
        <Surface style={styles.surface}>
          <Bus ref={blurMapBus}>
            <Offset
              offset={offset}
              t={{ uri: "https://i.imgur.com/SzbbUvX.png" }}
            />
          </Bus>
          <BlurV map={() => blurMapBus.current} passes={6} factor={6}>
            {{ uri: "https://i.imgur.com/NjbLHx2.jpg" }}
          </BlurV>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  touch: {},
  surface: { width: W, height: H },
});
