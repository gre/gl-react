import React from "react";
import { Surface } from "gl-react-dom";
import { Blur } from "gl-react-blur";

// gl-react-blur's Blur recursively chains Blur1D passes, cycling
// horizontal, vertical and diagonal directions with increasing radius
export default function BlurMultiExample({
  factor = 2,
  passes = 4,
}: {
  factor?: number;
  passes?: number;
}) {
  return (
    <Surface width={400} height={300}>
      <Blur factor={factor} passes={passes}>
        {"https://i.imgur.com/iPKTONG.jpg"}
      </Blur>
    </Surface>
  );
}
