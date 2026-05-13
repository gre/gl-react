import React from "react";
import { View, StyleSheet } from "react-native";
import { Uniform, Node, NearestCopy, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { golShaders } from "./gol";
import { useTimeLoop } from "../shared/useTimeLoop";

// In the web cookbook, the glider gun was drawn on a <canvas>. RN has no
// canvas, so we generate the same 64x64 pattern in a fragment shader instead.
const seedShaders = Shaders.create({
  GliderGun: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
const float SIZE = 64.0;
// Encoded Gosper glider gun cells (x, y) in a 64x64 grid.
bool isCell(vec2 p) {
  // Each pair is one live cell. Manually inlined to keep the GLSL simple.
  vec2 cells[36];
  cells[0] = vec2(1,5); cells[1] = vec2(1,6); cells[2] = vec2(2,5); cells[3] = vec2(2,6);
  cells[4] = vec2(11,5); cells[5] = vec2(11,6); cells[6] = vec2(11,7);
  cells[7] = vec2(12,4); cells[8] = vec2(12,8);
  cells[9] = vec2(13,3); cells[10] = vec2(13,9);
  cells[11] = vec2(14,3); cells[12] = vec2(14,9);
  cells[13] = vec2(15,6);
  cells[14] = vec2(16,4); cells[15] = vec2(16,8);
  cells[16] = vec2(17,5); cells[17] = vec2(17,6); cells[18] = vec2(17,7);
  cells[19] = vec2(18,6);
  cells[20] = vec2(21,3); cells[21] = vec2(21,4); cells[22] = vec2(21,5);
  cells[23] = vec2(22,3); cells[24] = vec2(22,4); cells[25] = vec2(22,5);
  cells[26] = vec2(23,2); cells[27] = vec2(23,6);
  cells[28] = vec2(25,1); cells[29] = vec2(25,2); cells[30] = vec2(25,6); cells[31] = vec2(25,7);
  cells[32] = vec2(35,3); cells[33] = vec2(35,4); cells[34] = vec2(36,3); cells[35] = vec2(36,4);
  for (int i = 0; i < 36; i++) {
    if (distance(cells[i], p) < 0.5) return true;
  }
  return false;
}
void main() {
  vec2 p = floor(uv * SIZE);
  // y is flipped so the top-left origin matches the canvas version.
  vec2 cellPos = vec2(p.x, SIZE - 1.0 - p.y);
  gl_FragColor = isCell(cellPos) ? vec4(1.0) : vec4(0.0, 0.0, 0.0, 1.0);
}`,
  },
});

function GameOfLifeGlider({ tick, size }: { tick: number; size: number }) {
  return (
    <Node
      shader={golShaders.GameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
      uniforms={{
        t:
          tick === 0 ? (
            <Node shader={seedShaders.GliderGun} width={size} height={size} />
          ) : (
            Uniform.Backbuffer
          ),
        size,
      }}
    />
  );
}

export default function GOLGlider() {
  const { tick } = useTimeLoop(20);
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <NearestCopy>
          <GameOfLifeGlider tick={tick} size={64} />
        </NearestCopy>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 360 },
});
