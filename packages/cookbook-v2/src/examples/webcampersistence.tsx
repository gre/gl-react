import React, { useEffect, useContext } from "react";
import { Uniform, LinearCopy, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video, VideoContext } from "./video";

const shaders = Shaders.create({
  Persistence: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t, back;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(t, uv),
    texture2D(back, uv+vec2(0.0, 0.005)),
    persistence
  ).rgb, 1.0);
}`,
  },
});

export const Persistence = ({
  children: t,
  persistence,
}: {
  children: any;
  persistence: number;
}) => (
  <Node
    shader={shaders.Persistence}
    backbuffering
    uniforms={{ t, back: Uniform.Backbuffer, persistence }}
  />
);

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

export default function WebcamPersistence({
  persistence = 0.8,
}: {
  persistence?: number;
}) {
  return (
    <Surface width={400} height={300}>
      <LinearCopy>
        <Persistence persistence={persistence}>
          {(redraw: any) => (
            <Video onFrame={redraw} autoPlay>
              <WebCamSource />
            </Video>
          )}
        </Persistence>
      </LinearCopy>
    </Surface>
  );
}
