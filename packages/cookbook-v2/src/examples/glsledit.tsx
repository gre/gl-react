import React, { useState } from "react";
import { Node, Visitor, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";

const defaultFrag = GLSL`precision highp float;
varying vec2 uv;
uniform float time;
void main() {
  float amnt;
  float nd;
  vec4 cbuff = vec4(0.0);
  for(float i=0.0; i<5.0;i++){
    nd = sin(3.17*0.8*uv.x + (i*0.1+sin(+time)*0.2) + time)*0.8+0.1 + uv.x;
    amnt = 1.0/abs(nd-uv.y)*0.01;
    cbuff += vec4(amnt, amnt*0.3 , amnt*uv.y, 90.0);
  }
  for(float i=0.0; i<1.0;i++){
    nd = sin(3.14*2.0*uv.y + i*40.5 + time)*90.3*(uv.y+80.3)+0.5;
    amnt = 1.0/abs(nd-uv.x)*0.015;
    cbuff += vec4(amnt*0.2, amnt*0.2 , amnt*uv.x, 1.0);
  }
  gl_FragColor = cbuff;
}
`;

function Preview({ frag, visitor }: { frag: string; visitor: Visitor }) {
  const { time } = useTimeLoop();
  return (
    <Surface width={500} height={200} visitor={visitor}>
      {/* Passing { frag } directly triggers dynamic shader compilation */}
      <Node shader={{ frag }} uniforms={{ time: time / 1000 }} />
    </Surface>
  );
}

export default function GLSLEdit() {
  const [frag, setFrag] = useState(defaultFrag);
  const [error, setError] = useState<string | null>(null);
  // Visitor catches shader compilation errors and reports success
  const [visitor] = useState(() => {
    const v = new Visitor();
    v.onSurfaceDrawError = (err: Error) => {
      setError(err.message);
      return true; // suppress error, keep last valid frame
    };
    v.onSurfaceDrawEnd = () => setError(null);
    return v;
  });

  return (
    <div>
      <Preview frag={frag} visitor={visitor} />
      {error && (
        <div style={{ color: "red", padding: 8, fontSize: 12 }}>{error}</div>
      )}
      {!error && (
        <div style={{ color: "green", padding: 8, fontSize: 12 }}>
          Compilation success!
        </div>
      )}
      <textarea
        style={{ width: 500, height: 200, fontFamily: "monospace", fontSize: 12 }}
        value={frag}
        onChange={(e) => setFrag(e.target.value)}
      />
    </div>
  );
}
