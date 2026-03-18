import React, { useState, useRef, useCallback } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurV } from "./blurmap";

const blurMapImages = [
  "https://i.imgur.com/SzbbUvX.png",
  "https://i.imgur.com/0PkQEk1.png",
  "https://i.imgur.com/z2CQHpg.png",
  "https://i.imgur.com/k9Eview.png",
  "https://i.imgur.com/wh0On3P.png",
];

const shaders = Shaders.create({
  Offset: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 offset;
void main () {
  gl_FragColor = texture2D(t, uv + offset);
}`,
  },
});

export const Offset = ({
  t,
  offset,
}: {
  t: any;
  offset: [number, number];
}) => <Node shader={shaders.Offset} uniforms={{ t, offset }} />;

export default function BlurMapMouse({
  map = blurMapImages[0],
}: {
  map?: string;
}) {
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const blurMapBus = useRef<any>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setOffset([
        -(e.clientX - rect.left - rect.width / 2) / rect.width,
        (e.clientY - rect.top - rect.height / 2) / rect.height,
      ]);
    },
    []
  );

  const onMouseLeave = useCallback(() => {
    setOffset([0, 0]);
  }, []);

  return (
    <Surface
      width={600}
      height={284}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <Bus ref={blurMapBus}>
        <Offset offset={offset} t={map} />
      </Bus>
      <BlurV map={() => blurMapBus.current} passes={6} factor={6}>
        {"https://i.imgur.com/NjbLHx2.jpg"}
      </BlurV>
    </Surface>
  );
}
