import React, { useMemo } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";

const shaders = Shaders.create({
  animated: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float time, amp, freq, colorSeparation, moving;
vec2 lookup (vec2 offset) {
  return mod(
    uv + amp * vec2(
        cos(freq*(uv.x+offset.x)+time/1000.0),
        sin(freq*(uv.y+offset.x)+time/1000.0))
      + vec2( moving * time/10000.0, 0.0),
    vec2(1.0));
}
void main() {
  vec3 col =  mix(vec3(
    texture2D(t, lookup(vec2(colorSeparation))).r,
    texture2D(t, lookup(vec2(-colorSeparation))).g,
    texture2D(t, lookup(vec2(0.0))).b),  vec3(1.0), 0.1);
  gl_FragColor = vec4(col * vec3(
    0.5 + 0.5 * cos(uv.y + uv.x * 49.0),
    0.6 * uv.x + 0.2 * sin(uv.y * 30.0),
    1.0 - uv.x + 0.5 * cos(uv.y * 2.0)
  ), 1.0);
}`,
  },
});

export const textSize = { width: 500, height: 200 };
export const textFont = "36px bold Helvetica";
export const textLineHeight = 40;
export const textPadding = 10;

function useTextDataURL(text: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = textSize.width;
    c.height = textSize.height;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, textSize.width, textSize.height);
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff";
      ctx.font = textFont;
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, textPadding, textPadding + i * textLineHeight);
      });
    }
    return c.toDataURL();
  }, [text]);
}

function AnimatedText({
  children: t,
  time,
}: {
  children: any;
  time: number;
}) {
  return (
    <Node
      shader={shaders.animated}
      uniforms={{
        t,
        time,
        freq: 20 - 14 * Math.sin(time / 7000),
        amp: 0.05 * (1 - Math.cos(time / 4000)),
        colorSeparation: 0.02,
        moving: 1,
      }}
    />
  );
}

export default function TextAnimated({
  text = "Hello world\n2d canvas text\ninjected as texture",
}: {
  text?: string;
}) {
  const { time } = useTimeLoop();
  const textDataURL = useTextDataURL(text);

  return (
    <Surface {...textSize}>
      <AnimatedText time={time}>
        {textDataURL}
      </AnimatedText>
    </Surface>
  );
}
