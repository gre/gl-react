import React, { useEffect, useContext } from "react";
import { Surface } from "gl-react-dom";
import { Video, VideoContext } from "./video";
import { Colorify, colorScales } from "./colorscale";

const WebCamSource = () => {
  const videoRef = useContext(VideoContext);
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (videoRef?.current && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(() => {});
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);
  return null;
};

export default function WebcamExample({
  color = Object.keys(colorScales)[0],
}: {
  color?: string;
}) {
  return (
    <Surface width={480} height={360}>
      <Colorify colorScale={colorScales[color] || colorScales.spectral}>
        {(redraw: any) => (
          <Video onFrame={redraw} autoPlay>
            <WebCamSource />
          </Video>
        )}
      </Colorify>
    </Surface>
  );
}
