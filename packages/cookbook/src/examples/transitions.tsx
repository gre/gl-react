import React from "react";
import { Shaders, Node, GLSL, LinearCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";

const transitionShaders = Shaders.create({
  fade: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
void main() {
  gl_FragColor = mix(texture2D(from, uv), texture2D(to, uv), progress);
}`,
  },
  circleOpen: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
void main() {
  float dist = distance(uv, vec2(0.5));
  float radius = progress * 0.75;
  gl_FragColor = dist < radius
    ? texture2D(to, uv)
    : texture2D(from, uv);
}`,
  },
  directionalWipe: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
void main() {
  float m = step(progress, uv.x);
  gl_FragColor = mix(texture2D(to, uv), texture2D(from, uv), m);
}`,
  },
  dissolve: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
  float r = rand(uv);
  gl_FragColor = r < progress
    ? texture2D(to, uv)
    : texture2D(from, uv);
}`,
  },
  squeeze: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D from, to;
uniform float progress;
void main() {
  float p = smoothstep(0.0, 1.0, progress);
  if (uv.y < 0.5 - p * 0.5 || uv.y > 0.5 + p * 0.5) {
    float squeezeY = (uv.y - 0.5) / (1.0 - p) + 0.5;
    gl_FragColor = texture2D(from, vec2(uv.x, squeezeY));
  } else {
    float revealY = (uv.y - (0.5 - p * 0.5)) / p;
    gl_FragColor = texture2D(to, vec2(uv.x, revealY));
  }
}`,
  },
});

const transitionList = [
  "fade",
  "circleOpen",
  "directionalWipe",
  "dissolve",
  "squeeze",
] as const;

const images =
  "wxqlQkh,G2Whuq3,0bUSEBX,giP58XN,iKdXwVm,IvpoR40,zJIxPEo,CKlmtPs,fnMylHI,vGXYiYy,MnOB9Le,YqsZKgc,0BJobQo,Otbz312"
    .split(",")
    .map((id) => `https://i.imgur.com/${id}.jpg`);

function GLTransition({
  from,
  to,
  progress,
  transition,
}: {
  from: string;
  to: string;
  progress: number;
  transition: keyof typeof transitionShaders;
}) {
  return (
    <Node
      shader={transitionShaders[transition]}
      uniforms={{ from, to, progress }}
    />
  );
}

function Slideshow({
  slides,
  delay,
  duration,
}: {
  slides: string[];
  delay: number;
  duration: number;
}) {
  const { time } = useTimeLoop();
  const total = delay + duration;
  const index = Math.floor(time / total);
  const from = slides[index % slides.length];
  const to = slides[(index + 1) % slides.length];
  const transition =
    transitionList[index % transitionList.length];
  const progress = (time - index * total - delay) / duration;

  return progress > 0 ? (
    <GLTransition
      from={from}
      to={to}
      progress={Math.min(progress, 1)}
      transition={transition}
    />
  ) : (
    <LinearCopy>{from}</LinearCopy>
  );
}

export default function Transitions() {
  return (
    <Surface width={600} height={400}>
      <Slideshow slides={images} delay={2000} duration={1500} />
    </Surface>
  );
}
