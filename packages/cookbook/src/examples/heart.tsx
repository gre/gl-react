import React, { useState, useRef, useEffect } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  Heart: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform vec3 color;
uniform float over, toggle;
void main() {
  float scale = 1.0 - 0.1 * over - 0.8 * toggle;
  vec2 offset = vec2(0.0, -0.3 - 0.1 * over - 0.7 * toggle);
  vec2 p = scale * (2.0 * uv - 1.0 + offset);
  float a = atan(p.x, p.y) / ${Math.PI};
  float r = length(p);
  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h - 0.3 * (1.0-over))/(6.0-5.0*h);
  float f = step(r,d) * pow(max(1.0-r/d, 0.0),0.25);
  vec3 t = texture2D(image, uv).rgb;
  vec3 c = mix(color * (1.0 + 0.6 * t), t, min(0.8 * over + toggle, 1.0));
  gl_FragColor = vec4(mix(vec3(1.0), c, f), 1.0);
}`,
  },
});

// Spring animation hook for smooth hover/click transitions
function useSpringValue(target: number, stiffness = 150, damping = 15) {
  const ref = useRef({ value: target, velocity: 0 });
  const [value, setValue] = useState(target);

  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.064);
      lastTime = now;
      const s = ref.current;
      const force = -stiffness * (s.value - target);
      const dampForce = -damping * s.velocity;
      s.velocity += (force + dampForce) * dt;
      s.value += s.velocity * dt;
      if (Math.abs(s.value - target) < 0.001 && Math.abs(s.velocity) < 0.001) {
        s.value = target;
        s.velocity = 0;
        setValue(target);
        return;
      }
      setValue(s.value);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping]);

  return value;
}

export default function Heart() {
  const [overTarget, setOverTarget] = useState(0);
  const [toggleTarget, setToggleTarget] = useState(0);
  const over = useSpringValue(overTarget);
  const toggle = useSpringValue(toggleTarget);

  return (
    <div
      style={{ display: "inline-block", cursor: "pointer" }}
      onClick={() => setToggleTarget((t) => (t ? 0 : 1))}
      onMouseEnter={() => setOverTarget(1)}
      onMouseLeave={() => setOverTarget(0)}
    >
      <Surface width={300} height={300}>
        <Node
          shader={shaders.Heart}
          uniforms={{
            color: [1, 0, 0],
            image: "https://i.imgur.com/GQo1KWq.jpg",
            over,
            toggle,
          }}
        />
      </Surface>
    </div>
  );
}
