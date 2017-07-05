//@flow
import { disposeObjectMap } from "./helpers/disposable";
import TextureLoader from "./TextureLoader";
import type { NDArray } from "ndarray";
import drawNDArrayTexture from "./helpers/drawNDArrayTexture";

export default class TextureLoaderNDArray extends TextureLoader<NDArray> {
  textures: WeakMap<NDArray, WebGLTexture>;
  constructor(gl: WebGLRenderingContext) {
    super(gl);
    this.textures = new WeakMap();
  }
  canLoad(obj: *) {
    return obj.shape && obj.data && obj.stride;
  }
  dispose() {
    disposeObjectMap(this.textures);
  }
  get(array: NDArray) {
    const { gl } = this;
    let texture = this.textures.get(array);
    if (!texture) {
      texture = gl.createTexture();
      this.textures.set(array, texture);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    drawNDArrayTexture(gl, texture, array);
    return texture;
  }
  getSize(array: NDArray) {
    return array.shape.slice(0, 2);
  }
}
