import React from "react";
import { Surface } from "gl-react-dom";
import { HelloBlue } from "./helloblue";
import { useTimeLoop } from "../hooks/useTimeLoop";

export default function HelloBlueAnim() {
  const { time } = useTimeLoop();
  return (
    <Surface width={300} height={300}>
      <HelloBlue blue={0.5 + 0.5 * Math.cos(time / 500)} />
    </Surface>
  );
}
