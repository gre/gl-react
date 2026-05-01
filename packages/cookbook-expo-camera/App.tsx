import "webgltexture-loader-expo-camera";
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera";
import { Surface } from "gl-react-expo";
import GLCamera from "./GLCamera";
import Effects from "./effects";
import Field from "./Field";

const { width: windowWidth } = Dimensions.get("window");

const percentagePrint = (v: number) => (v * 100).toFixed(0) + "%";
const radiantPrint = (r: number) => ((180 * r) / Math.PI).toFixed(0) + "°";

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

  const onSurfacePress = useCallback(() => {
    setFacing((f) => (f === "front" ? "back" : "front"));
  }, []);

  const onEffectChange = useCallback((value: number, id: string) => {
    setEffects((prev) => ({ ...prev, [id]: value }));
  }, []);

  const onEffectReset = useCallback((id: string) => {
    setEffects((prev) => ({ ...prev, [id]: initialEffectsState[id] }));
  }, []);

  let stage: React.ReactNode;
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
    <SafeAreaView
      style={styles.root}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView bounces={false} style={styles.root}>
        <StatusBar style="dark" />
        {stage}
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
});
