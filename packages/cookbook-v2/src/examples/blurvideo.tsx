import React, { Component, createRef } from "react";
import { Bus } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurV } from "./blurmap";
import { Saturate } from "./saturation";
import { useVideo } from "./video";

const blurMapImages = [
  "https://i.imgur.com/SzbbUvX.png",
  "https://i.imgur.com/0PkQEk1.png",
  "https://i.imgur.com/z2CQHpg.png",
  "https://i.imgur.com/k9Eview.png",
  "https://i.imgur.com/wh0On3P.png",
];

// Inner class component for Bus ref stability
class BlurVideoInner extends Component<{
  video: HTMLVideoElement;
  factor: number;
  passes: number;
  contrast: number;
  saturation: number;
  brightness: number;
  map: string;
}> {
  vid = createRef<any>();
  render() {
    const { video, factor, passes, contrast, saturation, brightness, map } = this.props;
    return (
      <Surface width={480} height={360} pixelRatio={1}>
        <Bus ref={this.vid}>
          <Saturate contrast={contrast} saturation={saturation} brightness={brightness}>
            {video}
          </Saturate>
        </Bus>
        <BlurV map={map} passes={passes} factor={factor}>
          {() => this.vid.current}
        </BlurV>
      </Surface>
    );
  }
}

export default function BlurVideo({
  factor = 2,
  passes = 4,
  contrast = 1,
  saturation = 1,
  brightness = 1,
  map = blurMapImages[0],
}: {
  factor?: number;
  passes?: number;
  contrast?: number;
  saturation?: number;
  brightness?: number;
  map?: string;
}) {
  const video = useVideo("/assets/video.mp4");
  if (!video) return null;
  return (
    <BlurVideoInner
      video={video}
      factor={factor}
      passes={passes}
      contrast={contrast}
      saturation={saturation}
      brightness={brightness}
      map={map}
    />
  );
}
