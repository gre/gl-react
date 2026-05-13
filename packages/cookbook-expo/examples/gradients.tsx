import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { useTimeLoop } from "../shared/useTimeLoop";

const shaders = Shaders.create({
  gradients: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec4 colors[3];
uniform vec2 particles[3];
void main () {
  vec4 sum = vec4(0.0);
  for (int i=0; i<3; i++) {
    vec4 c = colors[i];
    vec2 p = particles[i];
    float d = c.a * smoothstep(0.6, 0.2, distance(p, uv));
    sum += d * vec4(c.a * c.rgb, c.a);
  }
  if (sum.a > 1.0) {
    sum.rgb /= sum.a;
    sum.a = 1.0;
  }
  gl_FragColor = vec4(sum.a * sum.rgb, 1.0);
}`,
  },
});

export default function Gradients() {
  const { time } = useTimeLoop();
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <Node
          shader={shaders.gradients}
          uniforms={{
            colors: [
              [Math.cos(0.002 * time), Math.sin(0.002 * time), 0.2, 1],
              [Math.sin(0.002 * time), -Math.cos(0.002 * time), 0.1, 1],
              [0.3, Math.sin(3 + 0.002 * time), Math.cos(1 + 0.003 * time), 1],
            ],
            particles: [
              [0.3, 0.3],
              [0.7, 0.5],
              [0.4, 0.9],
            ],
          }}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 300, height: 300 },
});
