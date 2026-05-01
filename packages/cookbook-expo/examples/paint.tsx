import React, { useState } from "react";
import { View, StyleSheet, GestureResponderEvent } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";

const shaders = Shaders.create({
  paint: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
}`,
  },
});

const W = 360;
const H = 360;

export default function Paint() {
  const [state, setState] = useState({
    drawing: false,
    color: [1, 0, 0, 1] as [number, number, number, number],
    center: [0.5, 0.5] as [number, number],
    brushRadius: 0.04,
  });

  const positionFor = (e: GestureResponderEvent): [number, number] => {
    const { locationX, locationY } = e.nativeEvent;
    return [
      Math.max(0, Math.min(1, locationX / W)),
      Math.max(0, Math.min(1, 1 - locationY / H)),
    ];
  };

  const onGrant = (e: GestureResponderEvent) => {
    setState((s) => ({
      ...s,
      drawing: true,
      center: positionFor(e),
      color: [Math.random(), Math.random(), Math.random(), 1] as [
        number,
        number,
        number,
        number,
      ],
    }));
  };

  const onMove = (e: GestureResponderEvent) => {
    setState((s) =>
      s.drawing
        ? {
            ...s,
            center: positionFor(e),
            brushRadius: 0.03 + 0.01 * Math.cos(Date.now() / 1000),
          }
        : s
    );
  };

  const onRelease = () =>
    setState((s) => ({ ...s, drawing: false }));

  return (
    <View style={styles.center}>
      <View
        style={{ width: W, height: H }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={onGrant}
        onResponderMove={onMove}
        onResponderRelease={onRelease}
        onResponderTerminate={onRelease}
      >
        <Surface
          style={styles.surface}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node shader={shaders.paint} uniforms={state} clear={null} />
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: W, height: H },
});
