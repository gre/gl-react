// @flow
import "webgltexture-loader-expo-camera";
import { RGBAFormat, RGBFormat } from "three";
import { Camera } from "expo-camera";
import { resolveAsync } from "expo-asset-utils";
import * as Permissions from "expo-permissions";
import { GLView } from "expo-gl";
import { Surface } from "gl-react-expo";

export const name = "gl-react-expo";
export { Surface };

export const EXGLView = GLView;

function GLImage() {
  if (!(this instanceof GLImage)) {
    throw new Error(
      "Failed to construct 'Image': Please use the 'new' operator."
    );
  }
  this.onload = null;
  this._src = null;
}

GLImage.prototype = {
  //$FlowFixMe
  get src() {
    return this._src;
  },
  //$FlowFixMe
  set src(src) {
    if (this._src === src) return;
    delete this.localUri;
    this._src = src;

    if (src) {
      resolveAsync(src).then(({ localUri }) => {
        this.localUri = localUri;
        if (this.onload) this.onload();
      });
    }
  },
};

export const endFrame = (gl) => gl.endFrameEXP();

export const loadThreeJSTexture = (gl, src, texture) => {
  let image = new GLImage();
  image.onload = function () {
    texture.image = image;
    texture.format = RGBFormat;
    texture.needsUpdate = true;
  };
  image.src = src;
};

export { Camera };

export const askCameraPermission = async () => {
  const permission = await Permissions.askAsync(Permissions.CAMERA);
  return permission;
};
