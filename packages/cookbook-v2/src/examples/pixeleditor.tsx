import React, { useState, useRef, useCallback, useEffect } from "react";
import { Shaders, Node, GLSL, Bus } from "gl-react";
import { Surface } from "gl-react-dom";

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

const palette = [
  [1, 1, 1, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
  [1, 1, 0, 1],
  [1, 0, 1, 1],
  [0, 1, 1, 1],
  [1, 0.5, 0, 1],
  [0.5, 0, 0.5, 1],
  [0.6, 0.3, 0, 1],
  [0.5, 0.5, 0.5, 1],
  [1, 0.7, 0.8, 1],
  [0.2, 0.8, 0.2, 1],
  [0.2, 0.4, 0.8, 1],
  [0, 0, 0, 0],
];

const toolDefs: Record<string, { brushRadius: number; forceColor?: number[] }> = {
  "brush-1": { brushRadius: 0.55 / 16 },
  "brush-2": { brushRadius: 1.1 / 16 },
  "brush-4": { brushRadius: 2.2 / 16 },
  rubber: { brushRadius: 4 / 16, forceColor: [0, 0, 0, 0] },
};

const toolLabels: Record<string, string> = {
  "brush-1": "1px",
  "brush-2": "2px",
  "brush-4": "4px",
  rubber: "Erase",
};

function rgbaToCSS(c: number[]) {
  return `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${c[3]})`;
}

// Preload mario as dataURL so it's available synchronously for the init texture
function useMarioDataURL() {
  const [dataURL, setDataURL] = useState<string | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setDataURL(c.toDataURL());
      }
    };
    img.src = "/assets/mario.png";
  }, []);
  return dataURL;
}

function getPosition(e: React.MouseEvent): Vec2 {
  const canvas = (e.currentTarget as HTMLElement).querySelector("canvas");
  if (!canvas) return [0, 0];
  const rect = canvas.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
}

export default function PixelEditorExample() {
  const [color, setColor] = useState([1, 1, 1, 1]);
  const [toolKey, setToolKey] = useState("brush-4");
  const [drawing, setDrawing] = useState(false);
  const [mouse, setMouse] = useState<Vec2>([0.5, 0.5]);
  const [initialized, setInitialized] = useState(false);
  const paintNodeRef = useRef<any>(null);
  const marioDataURL = useMarioDataURL();

  const tool = toolDefs[toolKey] || toolDefs["brush-4"];

  const onPaintNodeRef = useCallback((ref: any) => {
    paintNodeRef.current = ref;
  }, []);

  const onDraw = useCallback(() => {
    setInitialized(true);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setDrawing(true);
    setMouse(getPosition(e));
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse(getPosition(e));
  }, []);

  const onMouseUp = useCallback(() => {
    setDrawing(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    setDrawing(false);
    setMouse([-1, -1]);
  }, []);

  if (!marioDataURL) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        style={{ display: "inline-block" }}
      >
        <Surface
          width={128 * 3}
          height={128 * 3}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
          style={{ cursor: "crosshair" }}
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
                ref={onPaintNodeRef}
                sync={!initialized}
                shader={!initialized ? shaders.initTexture : shaders.paint}
                width={size[0]}
                height={size[1]}
                uniforms={
                  !initialized
                    ? { t: marioDataURL }
                    : { drawing, color: tool.forceColor || color, mouse, brushRadius: tool.brushRadius || 0 }
                }
                clear={null}
                onDraw={onDraw}
              />
            </Bus>
          </Node>
        </Surface>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Tool</div>
          <div style={{ display: "flex", gap: 4 }}>
            {Object.entries(toolLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setToolKey(key)}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  background: toolKey === key ? "#4f46e5" : "#fff",
                  color: toolKey === key ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Color</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 160 }}>
            {palette.map((c, i) => (
              <div
                key={i}
                onClick={() => { setColor(c); if (toolKey === "rubber") setToolKey("brush-4"); }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  cursor: "pointer",
                  background: c[3] === 0
                    ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px"
                    : rgbaToCSS(c),
                  border: JSON.stringify(color) === JSON.stringify(c) ? "2px solid #4f46e5" : "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
