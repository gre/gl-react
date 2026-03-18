import React from "react";
import { Surface } from "gl-react-dom";
import { DiamondCrop } from "./diamondcrop";
import { HelloBlue } from "./helloblue";

export default function DiamondHello() {
  return (
    <Surface width={300} height={300}>
      <DiamondCrop>
        <HelloBlue blue={0.8} />
      </DiamondCrop>
    </Surface>
  );
}
