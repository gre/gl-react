// @flow
import Expo, { Camera } from "expo";
import { Surface } from "gl-react-expo";
import GLImage from "gl-react-expo/lib/Image";
export const name = "gl-react-expo";
export const EXGLView = Expo.GLView;
export { Surface };
export const endFrame = gl => gl.endFrameEXP();
export const loadThreeJSTexture = (gl, src, texture) => {
  let image = new GLImage();
  image.onload = function() {
    texture.image = image;
    texture.needsUpdate = true;
  };
  image.src = src;
};
export { Camera };
export const askCameraPermission = async () => {
  const permission = await Permissions.askAsync(Permissions.CAMERA);
  return permission;
};
