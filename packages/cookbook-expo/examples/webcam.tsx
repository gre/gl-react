import "webgltexture-loader-expo-camera";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Surface } from "gl-react-expo";
import { Colorify, colorScales } from "./colorscale";
import GLCamera from "../shared/GLCamera";

export default function WebcamExample({
  color = "spectral",
}: {
  color?: string;
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
        <Colorify colorScale={colorScales[color] || colorScales.spectral}>
          <GLCamera facing="front" />
        </Colorify>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  surface: { width: 320, height: 320 },
  note: { fontSize: 14 },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontSize: 13 },
});
