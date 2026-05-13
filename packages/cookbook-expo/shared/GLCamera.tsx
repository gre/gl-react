import React, { useRef, useEffect, useReducer } from "react";
import { GLSL, Node, Shaders } from "gl-react";
import { CameraView } from "expo-camera";

const shaders = Shaders.create({
  YFlip: {
    // expo-camera streams arrive Y-flipped, undo that.
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t, vec2(uv.x, 1.0 - uv.y));
}`,
  },
});

const CAMERA_W = 720;
const CAMERA_H = 1280;

// Reusable camera-as-texture node. The CameraView is rendered inside the Node's
// renderless slot; uniforms.t returns a {camera, width, height} descriptor that
// webgltexture-loader-expo-camera understands. A 60fps RAF forces re-renders so
// the GPU sees a fresh frame.
export default function GLCamera({
  facing = "front",
}: {
  facing?: "front" | "back";
}) {
  const cameraRef = useRef<any>(null);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      forceUpdate();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Node
      blendFunc={{ src: "one", dst: "one minus src alpha" }}
      shader={shaders.YFlip}
      uniforms={{
        t: () =>
          cameraRef.current
            ? { camera: cameraRef.current, width: CAMERA_W, height: CAMERA_H }
            : null,
      }}
    >
      <CameraView
        style={{ width: 400, height: 533.33 }}
        facing={facing}
        ref={cameraRef}
      />
    </Node>
  );
}
