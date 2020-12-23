// @flow
import React, { useRef, useEffect } from "react";
import { Shaders, GLSL, Node } from "gl-react";
import { Surface } from "gl-react-dom";
import raf from "raf";
import videoMP4 from "./video.mp4";
export { videoMP4 };
export const VideoContext: React$Context<?HTMLVideoElement> = React.createContext();

// We implement a component <Video> that is like <video>
// but provides a onFrame hook so we can efficiently only render
// if when it effectively changes.
export const Video = ({ onFrame, ...rest }: { onFrame: (number) => void }) => {
  const video = useRef();

  useEffect(() => {
    let handle;
    let lastTime;

    const loop = () => {
      handle = raf(loop);
      if (!video.current) return;
      const currentTime = video.current.currentTime;
      // Optimization that only call onFrame if time changes
      if (currentTime !== lastTime) {
        lastTime = currentTime;
        onFrame(currentTime);
      }
    };
    handle = raf(loop);

    return () => raf.cancel(handle);
  }, [onFrame]);

  return (
    <VideoContext.Provider value={video}>
      <video {...rest} ref={video} />
    </VideoContext.Provider>
  );
};

// Our example will simply split R G B channels of the video.
const shaders = Shaders.create({
  SplitColor: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children;
void main () {
  float y = uv.y * 3.0;
  vec4 c = texture2D(children, vec2(uv.x, mod(y, 1.0)));
  gl_FragColor = vec4(
    c.r * step(2.0, y) * step(y, 3.0),
    c.g * step(1.0, y) * step(y, 2.0),
    c.b * step(0.0, y) * step(y, 1.0),
    1.0);
}`,
  },
  //^NB perf: in fragment shader paradigm, we want to avoid code branch (if / for)
  // and prefer use of built-in functions and just giving the GPU some computating.
  // step(a,b) is an alternative to do if(): returns 1.0 if a<b, 0.0 otherwise.
});
const SplitColor = ({ children }) => (
  <Node shader={shaders.SplitColor} uniforms={{ children }} />
);

// We now uses <Video> in our GL graph.
// The texture we give to <SplitColor> is a (redraw)=><Video> function.
// redraw is passed to Video onFrame event and Node gets redraw each video frame.
export default () => (
  <Surface width={280} height={630} pixelRatio={1}>
    <SplitColor>
      {(redraw) => (
        <Video onFrame={redraw} autoPlay loop>
          <source type="video/mp4" src={videoMP4} />
        </Video>
      )}
    </SplitColor>
  </Surface>
);
