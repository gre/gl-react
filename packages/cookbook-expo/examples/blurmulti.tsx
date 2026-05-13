import React from "react";
import { View, StyleSheet } from "react-native";
import { connectSize } from "gl-react";
import { Surface } from "gl-react-expo";
import { Blur1D } from "./blurxy";

export const BlurV = connectSize(({ children, factor }: any) => {
  const s = factor;
  return (
    <Blur1D direction={[s, 0]}>
      <Blur1D direction={[0, s]}>
        <Blur1D direction={[s / Math.SQRT2, s / Math.SQRT2]}>
          <Blur1D direction={[-s / Math.SQRT2, s / Math.SQRT2]}>
            {children}
          </Blur1D>
        </Blur1D>
      </Blur1D>
    </Blur1D>
  );
});

export default function BlurMultiExample({ factor = 2 }: { factor?: number }) {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <BlurV factor={factor}>
          {{ uri: "https://i.imgur.com/iPKTONG.jpg" }}
        </BlurV>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 270 },
});
