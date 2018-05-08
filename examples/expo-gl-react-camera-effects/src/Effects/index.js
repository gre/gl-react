//@flow
import React, { PropTypes } from "react";
import Blur from "./Blur";
import ContrastSaturationBrightness from "./ContrastSaturationBrightness";
import Negative from "./Negative";
import HueRotate from "./HueRotate";
import ColorMatrix from "./ColorMatrix";
import Flyeye from "./FlyEye";

const mixArrays = (arr1, arr2, m) =>
  arr1.map((v, i) => (1 - m) * v + m * arr2[i]);

// prettier-ignore
const matrixForSepia = sepia =>
  mixArrays([
    // Identity
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], [
    // one way to do Sepia: grayscale & use alpha channel to add red & remove blue
    .3, .3, .3, 0,
    .6, .6, .6, 0,
    .1, .1, .1, 0,
    0.2, 0, -0.2, 1
  ], sepia);

const Effects = ({
  children,
  width,
  height,
  blur,
  contrast,
  saturation,
  brightness,
  negative,
  hue,
  sepia,
  flyeye,
}: *) => (
  <ColorMatrix matrix={matrixForSepia(sepia)}>
    <Flyeye value={flyeye}>
      <HueRotate hue={hue}>
        <Negative factor={negative}>
          <ContrastSaturationBrightness
            contrast={contrast}
            saturation={saturation}
            brightness={brightness}
          >
            <Blur passes={6} factor={blur} width={width} height={height}>
              {children}
            </Blur>
          </ContrastSaturationBrightness>
        </Negative>
      </HueRotate>
    </Flyeye>
  </ColorMatrix>
);

export default Effects;
