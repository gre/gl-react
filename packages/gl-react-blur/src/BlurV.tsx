import React from "react";
import { connectSize } from "gl-react";
import BlurV1D from "./BlurV1D";
import directionForPassDefault, {
  DirectionForPass,
} from "./directionForPassDefault";

export type BlurVProps = {
  /** the content to blur: any gl-react texture input */
  children: any;
  /** blur intensity, in pixels */
  factor: number;
  /** a texture whose red/green channels scale the blur per-pixel */
  map: any;
  /** number of BlurV1D passes to run (default 2: horizontal + vertical) */
  passes?: number;
  /** direction vector of a given pass; defaults to cycling H, V and diagonals */
  directionForPass?: DirectionForPass;
  width?: number;
  height?: number;
};

// Recursively nests BlurV1D passes for variable multi-directional blur
const BlurV = connectSize(
  ({
    children,
    factor,
    map,
    passes = 2,
    directionForPass = directionForPassDefault,
  }: any) => {
    const rec = (pass: number): any =>
      pass <= 0 ? (
        children
      ) : (
        <BlurV1D map={map} direction={directionForPass(pass, factor, passes)}>
          {rec(pass - 1)}
        </BlurV1D>
      );
    return rec(passes);
  }
) as unknown as React.ComponentType<BlurVProps>;

export default BlurV;
