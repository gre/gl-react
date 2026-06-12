import React from "react";
import { Surface } from "gl-react-dom";
import { BlurV } from "gl-react-blur";

const blurMapImages = [
  "https://i.imgur.com/SzbbUvX.png",
  "https://i.imgur.com/0PkQEk1.png",
  "https://i.imgur.com/z2CQHpg.png",
  "https://i.imgur.com/k9Eview.png",
  "https://i.imgur.com/wh0On3P.png",
];

// gl-react-blur's BlurV: blur intensity varies per-pixel,
// scaled by the red/green channels of the map texture
export default function BlurMapExample({
  factor = 2,
  passes = 4,
  map = blurMapImages[0],
}: {
  factor?: number;
  passes?: number;
  map?: string;
}) {
  return (
    <Surface width={600} height={284}>
      <BlurV map={map} passes={passes} factor={factor}>
        {"https://i.imgur.com/NjbLHx2.jpg"}
      </BlurV>
    </Surface>
  );
}
