import Expo from "expo";
import { Surface } from "gl-react-expo";
import { setRuntime } from "cookbook-rn-shared/lib/gl-react-implementation";
setRuntime({
  name: "gl-react-expo",
  EXGLView: Expo.GLView,
  Surface,
  endFrame: gl => gl.endFrameEXP(),
  loadThreeJSTexture: (gl, src, texture) => {
    let image = new Image();
    image.onload = function() {
      texture.image = image;
      texture.needsUpdate = true;
    };
    image.src = src;
  }
});
