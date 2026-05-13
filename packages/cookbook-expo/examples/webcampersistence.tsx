import "webgltexture-loader-expo-camera";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Uniform, LinearCopy, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import GLCamera from "../shared/GLCamera";

const shaders = Shaders.create({
  Persistence: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t, back;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(t, uv),
    texture2D(back, uv+vec2(0.0, 0.005)),
    persistence
  ).rgb, 1.0);
}`,
  },
});

const Persistence = ({
  children: t,
  persistence,
}: {
  children: any;
  persistence: number;
}) => (
  <Node
    shader={shaders.Persistence}
    backbuffering
    uniforms={{ t, back: Uniform.Backbuffer, persistence }}
  />
);

export default function WebcamPersistence({
  persistence = 0.8,
}: {
  persistence?: number;
}) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.note}>Camera permission required</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <LinearCopy>
          <Persistence persistence={persistence}>
            <GLCamera facing="front" />
          </Persistence>
        </LinearCopy>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  surface: { width: 360, height: 270 },
  note: { fontSize: 14 },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontSize: 13 },
});
