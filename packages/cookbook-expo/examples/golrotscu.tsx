import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "gl-react-expo";
import { useTimeLoop } from "../shared/useTimeLoop";
import { GameOfLife } from "./gol";
import { Rotating } from "./golrot";

function RotatingGameOfLife({ time }: { time: number }) {
  const golTick = useMemo(
    () => Math.floor(time / 200),
    [Math.floor(time / 200)]
  );
  return (
    <Rotating
      angle={(time / 1000) % (2 * Math.PI)}
      scale={0.6 + 0.15 * Math.cos(time / 500)}
    >
      <GameOfLife tick={golTick} />
    </Rotating>
  );
}

export default function GOLRotSCU() {
  const { time } = useTimeLoop();
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <RotatingGameOfLife time={time} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 360 },
});
