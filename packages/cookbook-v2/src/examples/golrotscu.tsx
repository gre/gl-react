import React, { useMemo } from "react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";
import { GameOfLife } from "./gol";
import { Rotating } from "./golrot";

function RotatingGameOfLife({ time }: { time: number }) {
  const golTick = useMemo(() => Math.floor(time / 200), [Math.floor(time / 200)]);
  return (
    <Rotating
      angle={(time / 1000) % (2 * Math.PI)}
      scale={0.6 + 0.15 * Math.cos(time / 500)}
    >
      <GameOfLife tick={golTick} />
    </Rotating>
  );
}

export function RotatingGameOfLifeLoop({ size }: { size?: number }) {
  const { time } = useTimeLoop();
  return <RotatingGameOfLife time={time} />;
}

export default function GOLRotSCU() {
  const { time } = useTimeLoop();
  return (
    <Surface width={500} height={500}>
      <RotatingGameOfLife time={time} />
    </Surface>
  );
}
