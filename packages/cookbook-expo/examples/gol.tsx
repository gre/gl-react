import React from "react";
import { View, StyleSheet } from "react-native";
import { Uniform, Shaders, Node, GLSL, NearestCopy } from "gl-react";
import { Surface } from "gl-react-expo";
import { useTimeLoop } from "../shared/useTimeLoop";

export const golShaders = Shaders.create({
  InitGameOfLife: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
float random (vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
  gl_FragColor = vec4(vec3(step(0.5, random(uv))), 1.0);
}`,
  },
  GameOfLife: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float size;
uniform sampler2D t;
void main() {
  float prev = step(0.5, texture2D(t, uv).r);
  float c = 1.0 / size;
  float sum =
  step(0.5, texture2D(t, uv + vec2(-1.0, -1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2(-1.0,  0.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2(-1.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 0.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0,  0.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0, -1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 0.0, -1.0)*c).r);
  float next = prev==1.0 && sum >= 2.0 && sum <= 3.0 || sum == 3.0 ? 1.0 : 0.0;
  gl_FragColor = vec4(vec3(next), 1.0);
}`,
  },
});

const refreshEveryTicks = 20;

export const GameOfLife = ({ tick }: { tick: number }) => {
  const size = 16 * (1 + Math.floor(tick / refreshEveryTicks));
  return tick % refreshEveryTicks === 0 ? (
    <Node
      shader={golShaders.InitGameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
    />
  ) : (
    <Node
      shader={golShaders.GameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
      uniforms={{ t: Uniform.Backbuffer, size }}
    />
  );
};

export default function GOL() {
  const { tick } = useTimeLoop(20);
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <NearestCopy>
          <GameOfLife tick={tick} />
        </NearestCopy>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 320, height: 320 },
});
