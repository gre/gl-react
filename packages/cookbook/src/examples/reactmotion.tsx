import React, { useState, useRef, useCallback, useEffect } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  cursor: {
    frag: GLSL`
precision mediump float;
varying vec2 uv;
uniform vec2 mouse;
void main() {
  float dist = pow(1.0 - distance(mouse, uv), 8.0);
  float edgeDistX = pow(1.0 - distance(mouse.x, uv.x), 32.0);
  float edgeDistY = pow(1.0 - distance(mouse.y, uv.y), 32.0);
  gl_FragColor = vec4(vec3(
    0.8 * dist + edgeDistX,
    0.7 * dist + edgeDistY,
    0.6 * dist) * smoothstep(1.0, 0.2, distance(mouse, uv)),
    1.0);
}`,
  },
});

// Spring animation hook (replaces react-motion)
function useMotionSpring(target: { x: number; y: number }) {
  const [current, setCurrent] = useState(target);
  const velRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    let handle: number;
    const stiffness = 170;
    const damping = 26;
    const dt = 1 / 60;

    const loop = () => {
      handle = requestAnimationFrame(loop);
      const t = targetRef.current;
      const v = velRef.current;

      const ax = stiffness * (t.x - current.x) - damping * v.x;
      const ay = stiffness * (t.y - current.y) - damping * v.y;

      v.x += ax * dt;
      v.y += ay * dt;

      setCurrent((p) => ({
        x: p.x + v.x * dt,
        y: p.y + v.y * dt,
      }));
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, []); // intentionally empty - uses refs

  return current;
}

export default function ReactMotionExample() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const springPos = useMotionSpring(mouse);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = (e.currentTarget as HTMLElement).querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (rect.bottom - e.clientY) / rect.height,
    });
  }, []);

  return (
    <div style={{ display: "inline-block" }} onMouseMove={onMouseMove}>
      <Surface width={600} height={600}>
        <Node
          shader={shaders.cursor}
          uniforms={{ mouse: [springPos.x, springPos.y] }}
        />
      </Surface>
    </div>
  );
}
