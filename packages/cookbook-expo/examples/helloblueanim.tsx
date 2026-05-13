import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "gl-react-expo";
import { HelloBlue } from "./helloblue";
import { useTimeLoop } from "../shared/useTimeLoop";

export default function HelloBlueAnim() {
  const { time } = useTimeLoop();
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <HelloBlue blue={0.5 + 0.5 * Math.cos(time / 500)} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 300, height: 300 },
});
