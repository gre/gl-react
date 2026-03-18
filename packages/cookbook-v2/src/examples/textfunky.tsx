import React, { useMemo } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  funky: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = texture2D(t, uv) * vec4(
    0.5 + 0.5 * cos(uv.x * 30.0),
    0.5 + 0.5 * sin(uv.y * 20.0),
    0.7 + 0.3 * sin(uv.y * 8.0),
    1.0);
}`,
  },
});

export const Funky = ({ children: t }: { children: any }) => (
  <Node shader={shaders.funky} uniforms={{ t }} />
);

function useTextCanvas() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 200;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 400, 200);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 48px Arial";
      const lines = ["Hello World", "2d canvas text", "injected as texture"];
      lines.forEach((line, i) => {
        ctx.fillText(line, 200, 60 + i * 56);
      });
    }
    return c.toDataURL();
  }, []);
}

export default function TextFunky() {
  const textDataURL = useTextCanvas();
  return (
    <Surface width={400} height={200}>
      <Funky>{textDataURL}</Funky>
    </Surface>
  );
}
