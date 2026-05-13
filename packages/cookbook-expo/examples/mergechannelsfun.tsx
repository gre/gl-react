import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "gl-react-expo";
import { MergeChannels } from "./mergechannels";
import { useTimeLoop } from "../shared/useTimeLoop";
import { Rotating } from "./golrot";
import { GameOfLife } from "./gol";

function RotatingGameOfLifeInner() {
  const { time } = useTimeLoop();
  const golTick = Math.floor(time / 200);
  return (
    <Rotating
      angle={(time / 1000) % (2 * Math.PI)}
      scale={0.6 + 0.15 * Math.cos(time / 500)}
    >
      <GameOfLife tick={golTick} />
    </Rotating>
  );
}

const img1 = require("../assets/imgs/img1.png");
const img2 = require("../assets/imgs/img2.png");

export default function MergeChannelsFun() {
  // The web cookbook used a 2D-canvas text + a video file as channels.
  // RN has neither, so we substitute a static image and the same image for
  // the third channel. The blue channel demonstrates static image input.
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <MergeChannels
          green={<RotatingGameOfLifeInner />}
          blue={img2}
          red={img1}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 320, height: 320 },
});
