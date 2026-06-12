import React from "react";
import { connectSize } from "gl-react";
import Blur1D from "./Blur1D";
import directionForPassDefault, {
  DirectionForPass,
} from "./directionForPassDefault";

export type BlurProps = {
  /** the content to blur: any gl-react texture input */
  children: any;
  /** blur intensity, in pixels */
  factor: number;
  /** number of Blur1D passes to run (default 2: horizontal + vertical) */
  passes?: number;
  /** direction vector of a given pass; defaults to cycling H, V and diagonals */
  directionForPass?: DirectionForPass;
  width?: number;
  height?: number;
};

// Recursively nests Blur1D passes for multi-directional gaussian blur
const Blur = connectSize(
  ({
    children,
    factor,
    passes = 2,
    directionForPass = directionForPassDefault,
  }: any) => {
    const rec = (pass: number): any =>
      pass <= 0 ? (
        children
      ) : (
        <Blur1D direction={directionForPass(pass, factor, passes)}>
          {rec(pass - 1)}
        </Blur1D>
      );
    return rec(passes);
  }
) as unknown as React.ComponentType<BlurProps>;

export default Blur;
