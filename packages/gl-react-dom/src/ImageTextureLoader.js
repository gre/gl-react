//@flow
import { TextureLoader } from "gl-react";
import { disposeObjectMap } from "gl-react/lib/helpers/disposable";
import type { DisposablePromise } from "gl-react/lib/helpers/disposable";

function loadImage(
  src: string,
  success: (img: Image) => void,
  failure: (e: Error) => void
) {
  let img = new window.Image();
  if (src.slice(0, 5) !== "data:") {
    img.crossOrigin = true;
  }
  img.onload = function() {
    if (img) {
      success(img);
    }
    img = null;
  };
  img.onabort = img.onerror = failure;
  img.src = src;
  return function() {
    if (img) {
      img.onload = null;
      img.onerror = null;
      img.onabort = null;
      img.src = "";
      img = null;
    }
  };
}

export default class ImageTextureLoader extends TextureLoader<string> {
  loads: { [key: string]: DisposablePromise<*> } = {};
  textures: { [key: string]: WebGLTexture } = {};
  dispose() {
    disposeObjectMap(this.loads);
    const { gl } = this;
    for (let k in this.textures) {
      gl.deleteTexture(this.textures[k]);
      delete this.textures[k];
    }
  }
  canLoad(input: any) {
    return typeof input === "string";
  }
  load(input: string) {
    const src = input;
    if (src in this.loads) {
      return this.loads[src];
    }
    let dispose = () => {};
    const promise = new Promise(
      (success, failure) => (dispose = loadImage(src, success, failure))
    ).then(img => {
      const { gl } = this;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this.textures[src] = texture;
      delete this.loads[src];
      return texture;
    });
    const d = { promise, dispose };
    this.loads[src] = d;
    return d;
  }
  get(input: string) {
    return this.textures[input];
  }
  getSize(input: string) {
    const img = this.get(input);
    if (img) {
      return [img.width, img.height];
    }
  }
}
