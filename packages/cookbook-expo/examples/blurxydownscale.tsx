import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "gl-react-expo";
import { BlurXY } from "./blurxy";

export default function BlurXYDownscale({ factor = 2 }: { factor?: number }) {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        {/* Blur runs downscaled then upsamples for performance. */}
        <BlurXY factor={factor} width={100} height={75}>
          {{ uri: "https://i.imgur.com/iPKTONG.jpg" }}
        </BlurXY>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 270 },
});
