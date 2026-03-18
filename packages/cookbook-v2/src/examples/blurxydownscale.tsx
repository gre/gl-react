import React from "react";
import { Surface } from "gl-react-dom";
import { BlurXY } from "./blurxy";

export default function BlurXYDownscale({ factor = 2 }: { factor?: number }) {
  return (
    <Surface width={400} height={300}>
      <BlurXY factor={factor} width={100} height={75}>
        {"https://i.imgur.com/iPKTONG.jpg"}
      </BlurXY>
    </Surface>
  );
}
