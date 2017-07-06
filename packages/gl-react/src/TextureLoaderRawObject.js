//@flow
import TextureLoader from "./TextureLoader";
export default class TextureLoaderRawObject<T> extends TextureLoader<T> {
  textureMemoized: WeakMap<T, WebGLTexture> = new WeakMap();
  textures: Array<WebGLTexture> = [];

  +mapInput: (t: T) => any;
  +mapInputSize: (t: T) => ?[number, number];

  dispose() {
    const { gl } = this;
    this.textures.forEach(t => gl.deleteTexture(t));
    this.textureMemoized = new WeakMap();
    this.textures = [];
  }

  getSize(obj: T) {
    let texture = this.textureMemoized.get(obj);
    if (!texture) return null;
    return this.mapInputSize(obj);
  }

  get(obj: T) {
    const { gl } = this;
    let texture = this.textureMemoized.get(obj);
    if (!texture) {
      texture = gl.createTexture();
      this.textureMemoized.set(obj, texture);
      this.textures.push(texture);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const value = this.mapInput ? this.mapInput(obj) : obj;
    if (value) {
      // $FlowFixMe we are loosely on types here because we allow more that browser WebGL impl
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        value
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        2,
        2,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
    }
    return texture;
  }
}
