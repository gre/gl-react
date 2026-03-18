import React, { useRef, useEffect, useState, createContext } from "react";
import { Shaders, GLSL, Node } from "gl-react";
import { Surface } from "gl-react-dom";

// VideoContext for webcam examples that need to attach a stream to a video element
export const VideoContext = createContext<React.RefObject<HTMLVideoElement> | null>(null);

// Legacy Video component for webcam examples (renders a hidden video element in the DOM)
export const Video = ({ onFrame, ...rest }: { onFrame: (t: number) => void; [key: string]: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let handle: number;
    let lastTime: number | undefined;
    const loop = () => {
      handle = requestAnimationFrame(loop);
      if (!videoRef.current) return;
      const currentTime = videoRef.current.currentTime;
      if (currentTime !== lastTime) {
        lastTime = currentTime;
        onFrame(currentTime);
      }
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [onFrame]);

  return (
    <VideoContext.Provider value={videoRef}>
      <video {...rest} ref={videoRef} style={{ display: "none" }} />
    </VideoContext.Provider>
  );
};

export function useVideo(src: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;
    video.play().catch(() => {});

    let handle: number;
    let lastTime: number | undefined;
    const loop = () => {
      handle = requestAnimationFrame(loop);
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        setTick((t) => t + 1);
      }
    };
    handle = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(handle);
      video.pause();
      video.src = "";
      videoRef.current = null;
    };
  }, [src]);

  return videoRef.current;
}

const shaders = Shaders.create({
  SplitColor: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children;
void main () {
  float y = uv.y * 3.0;
  vec4 c = texture2D(children, vec2(uv.x, mod(y, 1.0)));
  gl_FragColor = vec4(
    c.r * step(2.0, y) * step(y, 3.0),
    c.g * step(1.0, y) * step(y, 2.0),
    c.b * step(0.0, y) * step(y, 1.0),
    1.0);
}`,
  },
});

const SplitColor = ({ children }: { children: any }) => (
  <Node shader={shaders.SplitColor} uniforms={{ children }} />
);

export default function VideoExample() {
  const video = useVideo("/assets/video.mp4");
  if (!video) return null;
  return (
    <Surface width={280} height={630} pixelRatio={1}>
      <SplitColor>{video}</SplitColor>
    </Surface>
  );
}
