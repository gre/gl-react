import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "gl-react-expo";
import { DiamondCrop } from "./diamondcrop";
import { HelloBlue } from "./helloblue";

export default function DiamondHello() {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <DiamondCrop>
          <HelloBlue blue={0.8} />
        </DiamondCrop>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 300, height: 300 },
});
