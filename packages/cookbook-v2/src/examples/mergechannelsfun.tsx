import React, { useMemo } from "react";
import { Surface } from "gl-react-dom";
import { MergeChannels } from "./mergechannels";
import { useVideo } from "./video";
import { useTimeLoop } from "../hooks/useTimeLoop";
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

function useTextCanvas() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 400;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 400, 400);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 48px Arial";
      const lines = ["Hello World", "2d canvas text", "injected as texture"];
      lines.forEach((line, i) => {
        ctx.fillText(line, 200, 160 + i * 60);
      });
    }
    return c.toDataURL();
  }, []);
}

export default function MergeChannelsFun() {
  const textDataURL = useTextCanvas();
  const video = useVideo("/assets/video.mp4");

  return (
    <Surface width={400} height={400}>
      <MergeChannels
        green={<RotatingGameOfLifeInner />}
        blue={video || textDataURL}
        red={textDataURL}
      />
    </Surface>
  );
}
