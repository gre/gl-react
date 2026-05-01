import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, GestureResponderEvent } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";

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
      setCurrent((p) => {
        const ax = stiffness * (t.x - p.x) - damping * v.x;
        const ay = stiffness * (t.y - p.y) - damping * v.y;
        v.x += ax * dt;
        v.y += ay * dt;
        return { x: p.x + v.x * dt, y: p.y + v.y * dt };
      });
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, []);

  return current;
}

const W = 360;
const H = 360;

export default function ReactMotionExample() {
  const [target, setTarget] = useState({ x: 0.5, y: 0.5 });
  const pos = useMotionSpring(target);

  const onTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setTarget({
      x: Math.max(0, Math.min(1, locationX / W)),
      y: Math.max(0, Math.min(1, 1 - locationY / H)),
    });
  };

  return (
    <View style={styles.center}>
      <View
        style={{ width: W, height: H }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onTouch}
        onResponderMove={onTouch}
      >
        <Surface style={styles.surface}>
          <Node
            shader={shaders.cursor}
            uniforms={{ mouse: [pos.x, pos.y] }}
          />
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: W, height: H },
});
