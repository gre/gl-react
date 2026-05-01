import "webgltexture-loader-expo-camera";
import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Bus, Uniform, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { golShaders } from "./gol";
import GLCamera from "../shared/GLCamera";

const extraShaders = Shaders.create({
  Display: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D gol, webcam;
uniform float webcamRatio;
void main () {
  vec2 aspect = vec2(max(1.0, 1.0/webcamRatio), max(1.0, webcamRatio));
  vec2 p = uv * aspect + (1.0 - aspect) / 2.0;
  if (0.0>p.x||1.0<p.x||0.0>p.y||1.0<p.y) {
    gl_FragColor = vec4(0.0);
  }
  else {
    vec3 webcamC = texture2D(webcam, p).rgb;
    gl_FragColor = vec4(
      vec3(1.0) * texture2D(gol, p).r +
      webcamC * mix(step(0.5, webcamC.r), 0.9, 0.2),
    1.0);
  }
}
    `,
  },
});

const Display = ({ gol, webcam }: { gol: any; webcam: any }) => (
  <Node
    shader={extraShaders.Display}
    uniformsOptions={{ gol: { interpolation: "nearest" } }}
    uniforms={{
      gol,
      webcam,
      webcamRatio: Uniform.textureSizeRatio(webcam),
    }}
  />
);

function GameOfLifeWebcam({
  size,
  reset,
  resetTexture,
}: {
  size: number;
  reset: boolean;
  resetTexture: any;
}) {
  return (
    <Node
      shader={golShaders.GameOfLife}
      width={size}
      height={size}
      backbuffering
      sync
      uniforms={{
        t: reset ? resetTexture : Uniform.Backbuffer,
        size,
      }}
    />
  );
}

export default function GOLWebcam() {
  const [permission, requestPermission] = useCameraPermissions();
  const [reset, setReset] = useState(false);
  const [size] = useState(64);
  const webcamRef = useRef<any>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.note}>Camera permission required</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Pressable
        onPressIn={() => setReset(true)}
        onPressOut={() => setReset(false)}
      >
        <Surface style={styles.surface}>
          <Bus ref={webcamRef}>
            <GLCamera facing="front" />
          </Bus>
          <Display
            gol={
              <GameOfLifeWebcam
                reset={reset}
                size={size}
                resetTexture={() => webcamRef.current}
              />
            }
            webcam={() => webcamRef.current}
          />
        </Surface>
      </Pressable>
      <Text style={styles.hint}>Press and hold to reseed from camera</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  surface: { width: 320, height: 320 },
  note: { fontSize: 14 },
  hint: { fontSize: 11, color: "#666" },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontSize: 13 },
});
