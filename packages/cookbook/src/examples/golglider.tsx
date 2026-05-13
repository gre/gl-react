import React from "react";
import { Uniform, Node, NearestCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import { golShaders } from "./gol";
import { useTimeLoop } from "../hooks/useTimeLoop";

// Gosper glider gun 64x64 pattern drawn on a canvas
function createGliderGunTexture(): HTMLCanvasElement {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#fff";

  const cells = [
    [1, 5], [1, 6], [2, 5], [2, 6],
    [11, 5], [11, 6], [11, 7],
    [12, 4], [12, 8],
    [13, 3], [13, 9],
    [14, 3], [14, 9],
    [15, 6],
    [16, 4], [16, 8],
    [17, 5], [17, 6], [17, 7],
    [18, 6],
    [21, 3], [21, 4], [21, 5],
    [22, 3], [22, 4], [22, 5],
    [23, 2], [23, 6],
    [25, 1], [25, 2], [25, 6], [25, 7],
    [35, 3], [35, 4], [36, 3], [36, 4],
  ];

  cells.forEach(([x, y]) => {
    ctx.fillRect(x, y, 1, 1);
  });

  return canvas;
}

let gliderGunCanvas: HTMLCanvasElement | null = null;
function getGliderGunTexture() {
  if (!gliderGunCanvas) {
    gliderGunCanvas = createGliderGunTexture();
  }
  return gliderGunCanvas;
}

function GameOfLifeGlider({ tick, size }: { tick: number; size: number }) {
  return (
    <Node
      shader={golShaders.GameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
      uniforms={{
        // tick 0: initialize from canvas, then read from backbuffer
        t: tick === 0 ? getGliderGunTexture() : Uniform.Backbuffer,
        size,
      }}
    />
  );
}

export default function GOLGlider() {
  const { tick } = useTimeLoop(20);
  return (
    <Surface width={500} height={500}>
      <NearestCopy>
        <GameOfLifeGlider tick={tick} size={64} />
      </NearestCopy>
    </Surface>
  );
}
