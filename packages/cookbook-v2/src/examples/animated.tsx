import React, { useState, useRef, useCallback, useEffect } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  cursor: {
    frag: GLSL`
precision lowp float; varying vec2 uv; uniform vec2 style;
void main() {
  float dist = pow(1.0 - distance(style, uv), 8.0);
  gl_FragColor = vec4(smoothstep(2.0, 0.2, distance(style, uv)) * vec3(
    1.0 * dist + pow(1.0 - distance(style.y, uv.y), 16.0),
    0.5 * dist + pow(1.0 - distance(style.y, uv.y), 32.0),
    0.2 * dist + pow(1.0 - distance(style.x, uv.x), 32.0)), 1.0);
}`,
  },
});

// Spring physics for smooth cursor following
function useSpring(target: { x: number; y: number }) {
  const [pos, setPos] = useState(target);
  const velRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    let handle: number;
    const stiffness = 120;
    const damping = 14;
    const dt = 1 / 60;

    const loop = () => {
      handle = requestAnimationFrame(loop);
      const t = targetRef.current;
      const v = velRef.current;

      const ax = stiffness * (t.x - pos.x) - damping * v.x;
      const ay = stiffness * (t.y - pos.y) - damping * v.y;

      v.x += ax * dt;
      v.y += ay * dt;

      setPos((p) => ({
        x: p.x + v.x * dt,
        y: p.y + v.y * dt,
      }));
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, []); // intentionally empty - uses refs

  return pos;
}

export default function Animated() {
  const [target, setTarget] = useState({ x: 0.5, y: 0.5 });
  const pos = useSpring(target);

  // Convert DOM mouse position to UV coordinates (Y-flipped for GL)
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = (e.currentTarget as HTMLElement).querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setTarget({
      x: (e.clientX - rect.left) / rect.width,
      y: (rect.bottom - e.clientY) / rect.height,
    });
  }, []);

  return (
    <div style={{ display: "inline-block" }} onMouseMove={onMouseMove}>
      <Surface width={500} height={500}>
        <Node shader={shaders.cursor} uniforms={{ style: [pos.x, pos.y] }} />
      </Surface>
    </div>
  );
}
