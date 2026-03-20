import React from "react";
import { connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import { Blur1D } from "./blurxy";

// 4 directional blur passes for a smoother result
export const BlurV = connectSize(({ children, factor }: any) => {
  const s = factor;
  return (
    <Blur1D direction={[s, 0]}>
      <Blur1D direction={[0, s]}>
        <Blur1D direction={[s / Math.SQRT2, s / Math.SQRT2]}>
          <Blur1D direction={[-s / Math.SQRT2, s / Math.SQRT2]}>
            {children}
          </Blur1D>
        </Blur1D>
      </Blur1D>
    </Blur1D>
  );
});

export default function BlurMultiExample({ factor = 2 }: { factor?: number }) {
  return (
    <Surface width={400} height={300}>
      <BlurV factor={factor}>{"https://i.imgur.com/iPKTONG.jpg"}</BlurV>
    </Surface>
  );
}
