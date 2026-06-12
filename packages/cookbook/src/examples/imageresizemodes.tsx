import React from "react";
import { Surface } from "gl-react-dom";
import GLImage from "gl-react-image";

// The surface is wider than the image ratio, so each resizeMode
// behaves differently: cover crops, contain letterboxes, stretch distorts.
export default function ImageResizeModes({
  resizeMode = "cover",
  zoom = 1,
  centerX = 0.5,
  centerY = 0.5,
}: {
  resizeMode?: "cover" | "free" | "contain" | "stretch";
  zoom?: number;
  centerX?: number;
  centerY?: number;
}) {
  return (
    <Surface width={480} height={300}>
      <GLImage
        source="https://i.imgur.com/uTP9Xfr.jpg"
        resizeMode={resizeMode}
        zoom={zoom}
        center={[centerX, centerY]}
      />
    </Surface>
  );
}
