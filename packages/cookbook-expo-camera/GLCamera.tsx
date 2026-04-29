import React, { useRef, useEffect, useReducer } from "react";
import { GLSL, Node, Shaders } from "gl-react";
import { CameraView } from "expo-camera";

const shaders = Shaders.create({
  YFlip: {
    // NB we need to YFlip the stream
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t, vec2(uv.x, 1.0 - uv.y));
}`,
  },
});

export default function GLCamera({
  facing = "front",
}: {
  facing?: "front" | "back";
}) {
  const cameraRef = useRef<any>(null);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Force re-renders at 60fps to update the camera texture
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
        t: () => cameraRef.current,
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
