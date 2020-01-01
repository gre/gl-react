//@flow
import React, { useRef, useEffect, useCallback } from "react";
import { Shaders, Node, GLSL, Bus, LinearCopy } from "gl-react";
import { Surface, askCameraPermission } from "../../gl-react-implementation";
import { Video } from "expo-av";
import raf from "raf";

// Our example will simply split R G B channels of the video.
const shaders = Shaders.create({
  SplitColor: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D stream;
void main () {
  float y = uv.y * 3.0;
  vec4 c = texture2D(stream, vec2(uv.x, mod(y, 1.0)));
  gl_FragColor = vec4(
    c.r * step(2.0, y) * step(y, 3.0),
    c.g * step(1.0, y) * step(y, 2.0),
    c.b * step(0.0, y) * step(y, 1.0),
    1.0);
}`
  }
  //^NB perf: in fragment shader paradigm, we want to avoid code branch (if / for)
  // and prefer use of built-in functions and just giving the GPU some computating.
  // step(a,b) is an alternative to do if(): returns 1.0 if a<b, 0.0 otherwise.
});
const SplitColor = ({ stream }) => (
  <Node shader={shaders.SplitColor} uniforms={{ stream }} />
);

// We now uses <Video> in our GL graph.
// The texture we give to <SplitColor> is a (redraw)=><Video> function.
// redraw is passed to Video onFrame event and Node gets redraw each video frame.
export default ({ width }) => {
  const [videoRef, stream] = useVideoStream();

  return (
    <Surface style={{ width, height: (width * 300) / 400 }}>
      <Video
        ref={videoRef}
        source={{
          uri: "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4"
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
      />

      <SplitColor stream={stream} />
    </Surface>
  );
};

// some magic to loosely connect things (run a request animation frame)
function useVideoStream() {
  const video = useRef();
  const onFrameCallbackRef = useRef();

  useEffect(() => {
    let handle;
    const loop = () => {
      handle = raf(loop);
      if (onFrameCallbackRef.current) onFrameCallbackRef.current();
    };
    handle = raf(loop);
    return () => raf.cancel(handle);
  }, []);

  const stream = useCallback(redraw => {
    onFrameCallbackRef.current = redraw;
    return video;
  }, []);

  return [video, stream];
}
