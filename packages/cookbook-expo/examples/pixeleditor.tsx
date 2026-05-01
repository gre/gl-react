import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Shaders, Node, GLSL, Bus } from "gl-react";
import { Surface } from "gl-react-expo";

type Vec2 = [number, number];

const shaders = Shaders.create({
  paint: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec4 color;
uniform vec2 mouse;
uniform float brushRadius;
uniform bool drawing;
void main() {
  if (drawing) {
    if (length(uv - mouse) < brushRadius) {
      gl_FragColor = color;
    } else {
      discard;
    }
  } else {
    discard;
  }
}`,
  },
  initTexture: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t,uv);
}`,
  },
  pixelEditor: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec4 color;
uniform vec2 size, mouse, gridBorder;
uniform float brushRadius;
uniform sampler2D t;
void main() {
  vec2 p = floor(uv * size) / size;
  vec2 remain = mod(uv * size, vec2(1.0));
  float m =
    step(remain.x, 1.0 - gridBorder.x) *
    step(remain.y, 1.0 - gridBorder.y);
  float inBrushSize =
    step(length(p + (0.5 / size) - mouse), brushRadius);
  vec4 c = mix(texture2D(t, uv), color, 0.6 * inBrushSize);
  gl_FragColor = vec4(
    m * c.rgb,
    mix(1.0, c.a, m));
}`,
  },
});

const size: Vec2 = [16, 16];
const gridBorder: Vec2 = [1 / 8, 1 / 8];

const palette: [number, number, number, number][] = [
  [1, 1, 1, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
  [1, 1, 0, 1],
  [1, 0, 1, 1],
  [0, 1, 1, 1],
];

const toolDefs: Record<
  string,
  { brushRadius: number; forceColor?: number[] }
> = {
  "brush-1": { brushRadius: 0.55 / 16 },
  "brush-2": { brushRadius: 1.1 / 16 },
  "brush-4": { brushRadius: 2.2 / 16 },
  rubber: { brushRadius: 4 / 16, forceColor: [0, 0, 0, 0] },
};
const toolKeys = Object.keys(toolDefs);

const W = 320;
const H = 320;

const marioAsset = require("../assets/imgs/mario.png");

export default function PixelEditorExample() {
  const [color, setColor] = useState<[number, number, number, number]>([
    1, 1, 1, 1,
  ]);
  const [toolKey, setToolKey] = useState("brush-4");
  const [drawing, setDrawing] = useState(false);
  const [mouse, setMouse] = useState<Vec2>([0.5, 0.5]);
  const [initialized, setInitialized] = useState(false);

  const tool = toolDefs[toolKey] || toolDefs["brush-4"];

  const onDraw = useCallback(() => setInitialized(true), []);

  const positionFor = (e: GestureResponderEvent): Vec2 => {
    const { locationX, locationY } = e.nativeEvent;
    return [
      Math.max(0, Math.min(1, locationX / W)),
      Math.max(0, Math.min(1, 1 - locationY / H)),
    ];
  };

  return (
    <View style={styles.row}>
      <View
        style={{ width: W, height: H }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          setDrawing(true);
          setMouse(positionFor(e));
        }}
        onResponderMove={(e) => setMouse(positionFor(e))}
        onResponderRelease={() => setDrawing(false)}
        onResponderTerminate={() => setDrawing(false)}
      >
        <Surface
          style={{ width: W, height: H }}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node
            shader={shaders.pixelEditor}
            uniformsOptions={{ t: { interpolation: "nearest" } }}
            uniforms={{
              size,
              gridBorder,
              brushRadius: tool.brushRadius || 0,
              mouse,
              color: tool.forceColor || color,
            }}
          >
            <Bus uniform="t">
              <Node
                sync={!initialized}
                shader={!initialized ? shaders.initTexture : shaders.paint}
                width={size[0]}
                height={size[1]}
                uniforms={
                  !initialized
                    ? { t: marioAsset }
                    : {
                        drawing,
                        color: tool.forceColor || color,
                        mouse,
                        brushRadius: tool.brushRadius || 0,
                      }
                }
                clear={null}
                onDraw={onDraw}
              />
            </Bus>
          </Node>
        </Surface>
      </View>
      <View style={styles.controls}>
        <Text style={styles.label}>Tool</Text>
        <View style={styles.toolRow}>
          {toolKeys.map((key) => (
            <Pressable
              key={key}
              onPress={() => setToolKey(key)}
              style={[styles.tool, toolKey === key && styles.toolActive]}
            >
              <Text
                style={[
                  styles.toolText,
                  toolKey === key && styles.toolTextActive,
                ]}
              >
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Color</Text>
        <View style={styles.swatchRow}>
          {palette.map((c, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setColor(c);
                if (toolKey === "rubber") setToolKey("brush-4");
              }}
              style={[
                styles.swatch,
                {
                  backgroundColor: `rgba(${Math.round(c[0] * 255)},${Math.round(
                    c[1] * 255
                  )},${Math.round(c[2] * 255)},${c[3]})`,
                  borderColor:
                    JSON.stringify(color) === JSON.stringify(c)
                      ? "#4f46e5"
                      : "#ccc",
                  borderWidth:
                    JSON.stringify(color) === JSON.stringify(c) ? 2 : 1,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  controls: { flexDirection: "column", gap: 8, paddingTop: 4 },
  label: { fontSize: 12, fontWeight: "600" },
  toolRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tool: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  toolActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  toolText: { fontSize: 11, color: "#333" },
  toolTextActive: { color: "#fff" },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, maxWidth: 140 },
  swatch: { width: 24, height: 24, borderRadius: 3 },
});
