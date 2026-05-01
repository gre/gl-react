import React from "react";
import Blur from "./Blur";
import ContrastSaturationBrightness from "./ContrastSaturationBrightness";
import Negative from "./Negative";
import HueRotate from "./HueRotate";
import ColorMatrix from "./ColorMatrix";
import FlyEye from "./FlyEye";

const mixArrays = (arr1: number[], arr2: number[], m: number) =>
  arr1.map((v, i) => (1 - m) * v + m * arr2[i]);

// prettier-ignore
const matrixForSepia = (sepia: number) =>
  mixArrays([
    // Identity
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ], [
    // Sepia: grayscale & use alpha channel to add red & remove blue
    .3, .3, .3, 0,
    .6, .6, .6, 0,
    .1, .1, .1, 0,
    0.2, 0, -0.2, 1
  ], sepia);

export default function Effects({
  children,
  blur,
  contrast,
  saturation,
  brightness,
  negative,
  hue,
  sepia,
  flyeye,
}: {
  children: any;
  blur: number;
  contrast: number;
  saturation: number;
  brightness: number;
  negative: number;
  hue: number;
  sepia: number;
  flyeye: number;
}) {
  return (
    <ColorMatrix matrix={matrixForSepia(sepia)}>
      <FlyEye value={flyeye}>
        <HueRotate hue={hue}>
          <Negative factor={negative}>
            <ContrastSaturationBrightness
              contrast={contrast}
              saturation={saturation}
              brightness={brightness}
            >
              <Blur passes={6} factor={blur}>
                {children}
              </Blur>
            </ContrastSaturationBrightness>
          </Negative>
        </HueRotate>
      </FlyEye>
    </ColorMatrix>
  );
}
