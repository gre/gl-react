import React, { useState, useEffect } from "react";
import { Shaders, Node, GLSL, Uniform, NearestCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";

const shaders = Shaders.create({
  blur1D: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction);
}`,
  },
  init: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = texture2D(t, uv);
}`,
  },
});

export default function BlurFeedback({
  image = "https://i.imgur.com/iPKTONG.jpg",
  factor = 1,
}: {
  image?: string;
  factor?: number;
}) {
  const { tick } = useTimeLoop();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(false);
  }, [image]);

  const onDraw = () => {
    if (!initialized) setInitialized(true);
  };

  void tick; // tick triggers re-renders for the feedback loop

  return (
    <Surface width={400} height={300}>
      <NearestCopy>
        {!initialized ? (
          <Node
            shader={shaders.init}
            uniforms={{ t: image }}
            backbuffering
            sync
            onDraw={onDraw}
          />
        ) : (
          // Each frame reads its own previous output via Backbuffer
          <Node
            shader={shaders.blur1D}
            uniforms={{
              t: Uniform.Backbuffer,
              resolution: [400, 300],
              direction: [
                factor * Math.cos(tick * 0.1),
                factor * Math.sin(tick * 0.1),
              ],
            }}
            backbuffering
            sync
          />
        )}
      </NearestCopy>
    </Surface>
  );
}
