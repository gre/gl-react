import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
import { Bus, Uniform, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video, VideoContext } from "./video";
import { golShaders } from "./gol";
import { useTimeLoop } from "../hooks/useTimeLoop";

const extraShaders = Shaders.create({
  Display: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D gol, webcam;
uniform float webcamRatio;
void main () {
  vec2 aspect = vec2(max(1.0, 1.0/webcamRatio), max(1.0, webcamRatio));
  vec2 p = uv * aspect + (1.0 - aspect) / 2.0;
  if (0.0>p.x||1.0<p.x||0.0>p.y||1.0<p.y) {
    gl_FragColor = vec4(0.0);
  }
  else {
    vec3 webcamC = texture2D(webcam, p).rgb;
    gl_FragColor = vec4(
      vec3(1.0) * texture2D(gol, p).r +
      webcamC * mix(step(0.5, webcamC.r), 0.9, 0.2),
    1.0);
  }
}
    `,
  },
});

const Display = ({ gol, webcam }: { gol: any; webcam: any }) => (
  <Node
    shader={extraShaders.Display}
    uniformsOptions={{ gol: { interpolation: "nearest" } }}
    uniforms={{
      gol,
      webcam,
      webcamRatio: Uniform.textureSizeRatio(webcam),
    }}
  />
);

function GameOfLifeWebcam({
  size,
  reset,
  resetTexture,
}: {
  size: number;
  reset: boolean;
  resetTexture: any;
}) {
  const { tick } = useTimeLoop(4);
  return (
    <Node
      shader={golShaders.GameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
      uniforms={{
        t: reset ? resetTexture : Uniform.Backbuffer,
        size,
      }}
    />
  );
}

const WebCamSource = () => {
  const videoRef = useContext(VideoContext);
  useEffect(() => {
    if (videoRef?.current && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    }
  }, [videoRef]);
  return null;
};

export default function GOLWebcam() {
  const [reset, setReset] = useState(false);
  const [size, setSize] = useState(32);
  const webcamRef = useRef<any>(null);

  const onMouseDown = useCallback(() => {
    setReset(true);
    setSize(Math.floor(10 + 200 * Math.random() * Math.random()));
  }, []);

  const onMouseUp = useCallback(() => {
    setReset(false);
  }, []);

  return (
    <Surface
      style={{ cursor: "pointer" }}
      width={400}
      height={400}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <Bus ref={webcamRef}>
        {(redraw: any) => (
          <Video onFrame={redraw} autoPlay>
            <WebCamSource />
          </Video>
        )}
      </Bus>

      <Display
        gol={
          <GameOfLifeWebcam
            reset={reset}
            size={size}
            resetTexture={() => webcamRef.current}
          />
        }
        webcam={() => webcamRef.current}
      />
    </Surface>
  );
}
