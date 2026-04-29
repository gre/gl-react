import "./CameraViewTextureLoader";
import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Text,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Surface } from "gl-react-expo";
import { GLSL, Node, Shaders } from "gl-react";
import GLCamera from "./GLCamera";
import Effects from "./effects";
import Field from "./Field";

type DebugMode = "raw" | "gl-red" | "gl-static" | "gl-camera" | "full";
const MODES: DebugMode[] = ["raw", "gl-red", "gl-static", "gl-camera", "full"];

const debugShaders = Shaders.create({
  Solid: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float t;
void main(){
  gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(t), 1.0);
}`,
  },
  Red: {
    frag: GLSL`
precision highp float;
void main(){
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`,
  },
});

const { width: windowWidth } = Dimensions.get("window");

const percentagePrint = (v: number) => (v * 100).toFixed(0) + "%";
const radiantPrint = (r: number) => ((180 * r) / Math.PI).toFixed(0) + "\u00B0";

// prettier-ignore
const fields = [
  { id: "blur", name: "Blur", min: 0, max: 6, step: 0.1, prettyPrint: (blur: number) => blur.toFixed(1) },
  { id: "contrast", name: "Contrast", min: 0, max: 4, step: 0.1, prettyPrint: percentagePrint },
  { id: "brightness", name: "Brightness", min: 0, max: 4, step: 0.1, prettyPrint: percentagePrint },
  { id: "saturation", name: "Saturation", min: 0, max: 10, step: 0.1, prettyPrint: percentagePrint },
  { id: "hue", name: "HueRotate", min: 0, max: 2 * Math.PI, step: 0.1, prettyPrint: radiantPrint },
  { id: "negative", name: "Negative", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint },
  { id: "sepia", name: "Sepia", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint },
  { id: "flyeye", name: "FlyEye", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint },
];

const initialEffectsState: Record<string, number> = {
  blur: 0,
  saturation: 1,
  contrast: 1,
  brightness: 1,
  negative: 0,
  hue: 0,
  sepia: 0,
  flyeye: 0,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

function AppInner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [effects, setEffects] = useState(initialEffectsState);
  const [mode, setMode] = useState<DebugMode>("full");

  const onSurfacePress = useCallback(() => {
    setFacing((f) => (f === "front" ? "back" : "front"));
  }, []);

  const onEffectChange = useCallback((value: number, id: string) => {
    setEffects((prev) => ({ ...prev, [id]: value }));
  }, []);

  const onEffectReset = useCallback((id: string) => {
    setEffects((prev) => ({ ...prev, [id]: initialEffectsState[id] }));
  }, []);

  let stage: React.ReactNode = null;
  if (!permission) {
    stage = <Text style={styles.loading}>Loading...</Text>;
  } else if (!permission.granted) {
    stage = (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  } else if (mode === "raw") {
    stage = (
      <Pressable onPress={onSurfacePress} style={styles.surface}>
        <CameraView style={{ flex: 1 }} facing={facing} />
      </Pressable>
    );
  } else if (mode === "gl-red") {
    stage = (
      <Surface style={styles.surface}>
        <Node shader={debugShaders.Red} />
      </Surface>
    );
  } else if (mode === "gl-static") {
    stage = (
      <Surface style={styles.surface}>
        <Node shader={debugShaders.Solid} uniforms={{ t: Date.now() / 1000 }} />
      </Surface>
    );
  } else if (mode === "gl-camera") {
    stage = (
      <Pressable onPress={onSurfacePress}>
        <Surface style={styles.surface}>
          <GLCamera facing={facing} />
        </Surface>
      </Pressable>
    );
  } else {
    stage = (
      <Pressable onPress={onSurfacePress}>
        <Surface style={styles.surface}>
          <Effects {...effects}>
            <GLCamera facing={facing} />
          </Effects>
        </Surface>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom", "left", "right"]}>
    <ScrollView bounces={false} style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <Pressable
            key={m}
            style={[
              styles.modeButton,
              mode === m && styles.modeButtonActive,
            ]}
            onPress={() => setMode(m)}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === m && styles.modeButtonTextActive,
              ]}
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>
      {stage}
      <Text style={styles.debugLabel}>
        mode={mode} · facing={facing} · tap surface to flip
      </Text>
      <Text style={styles.debugLabel}>
        state: blur={effects.blur.toFixed(2)} neg=
        {effects.negative.toFixed(2)} hue={effects.hue.toFixed(2)} sat=
        {effects.saturation.toFixed(2)}
      </Text>

      <View style={styles.fields}>
        {fields.map(({ id, ...props }) => (
          <Field
            {...props}
            key={id}
            id={id}
            value={effects[id]}
            onChange={onEffectChange}
            onReset={onEffectReset}
          />
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEE",
  },
  surface: {
    width: windowWidth * 0.75,
    height: windowWidth,
    alignSelf: "center",
  },
  fields: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#EEE",
  },
  loading: {
    padding: 100,
    textAlign: "center",
  },
  permissionContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#333",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  debugLabel: {
    color: "#444",
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 6,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  modeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ddd",
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: "#333",
  },
  modeButtonText: {
    color: "#333",
    fontSize: 11,
    fontWeight: "500",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
});
