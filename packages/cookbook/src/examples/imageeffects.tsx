import React from "react";
import { Surface } from "gl-react-dom";
import GLImage from "gl-react-image";
import { Saturate } from "./saturation";

// GLImage renders a regular gl-react Node, so it composes like any other:
// here the cover-cropped image is the texture input of the Saturate effect.
export default function ImageEffects({
  saturation = 1,
  zoom = 0.6,
  centerX = 0.5,
  centerY = 0.5,
}: {
  saturation?: number;
  zoom?: number;
  centerX?: number;
  centerY?: number;
}) {
  return (
    <Surface width={480} height={300}>
      <Saturate contrast={1} brightness={1} saturation={saturation}>
        <GLImage
          source="https://i.imgur.com/iPKTONG.jpg"
          resizeMode="cover"
          zoom={zoom}
          center={[centerX, centerY]}
        />
      </Saturate>
    </Surface>
  );
}
