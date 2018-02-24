import Expo from "expo";
import { Surface } from "gl-react-expo";
export const name = "gl-react-expo";
export const EXGLView = Expo.GLView;
export { Surface };
export const endFrame = gl => gl.endFrameEXP();
export const loadThreeJSTexture = (gl, src, texture) => {
  let image = new Image();
  image.onload = function() {
    texture.image = image;
    texture.needsUpdate = true;
  };
  image.src = src;
};
