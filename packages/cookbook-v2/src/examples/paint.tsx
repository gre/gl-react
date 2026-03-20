import React, { useState, useCallback } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

function getPosition(e: React.MouseEvent): [number, number] {
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
}

const shaders = Shaders.create({
  paint: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard; // preserve existing framebuffer content
    }
  }
  else {
    discard;
  }
} `,
  },
});

export default function Paint() {
  const [state, setState] = useState({
    drawing: false,
    color: [1, 0, 0, 1] as [number, number, number, number],
    center: [0.5, 0.5] as [number, number],
    brushRadius: 0.04,
  });

  const onMouseLeave = useCallback(() => {
    setState((s) => ({ ...s, drawing: false }));
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setState((s) => {
        if (!s.drawing) return s;
        return {
          ...s,
          center: getPosition(e),
          brushRadius: 0.03 + 0.01 * Math.cos(Date.now() / 1000),
        };
      });
    },
    []
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setState((s) => ({
      ...s,
      drawing: true,
      center: getPosition(e),
      color: [
        Math.random(),
        Math.random(),
        Math.random(),
        1,
      ] as [number, number, number, number],
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    setState((s) => ({ ...s, drawing: false }));
  }, []);

  return (
    <Surface
      width={500}
      height={500}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
      style={{ cursor: "crosshair" }}
    >
      <Node shader={shaders.paint} uniforms={state} clear={null} />
    </Surface>
  );
}
