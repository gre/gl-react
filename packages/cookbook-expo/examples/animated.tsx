import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, GestureResponderEvent } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";

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
      setPos((p) => {
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

  return pos;
}

const W = 320;
const H = 320;

export default function Animated() {
  const [target, setTarget] = useState({ x: 0.5, y: 0.5 });
  const pos = useSpring(target);

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
            uniforms={{ style: [pos.x, pos.y] }}
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
