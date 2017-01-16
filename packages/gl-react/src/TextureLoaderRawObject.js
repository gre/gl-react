//@flow
import TextureLoader from "./TextureLoader";
export default class TextureLoaderRawObject<T> extends TextureLoader<T> {
  textureMemoized: WeakMap<T, WebGLTexture> = new WeakMap();
  textures: Array<WebGLTexture> = [];

  +mapInput: (t: T)=>any;

  dispose() {
    const {gl} = this;
    this.textures.forEach(t => gl.deleteTexture(t));
    this.textureMemoized = new WeakMap();
    this.textures = [];
  }

  get (obj: T) {
    const { gl } = this;
    let texture = this.textureMemoized.get(obj);
    if (!texture) {
      texture = gl.createTexture();
      this.textureMemoized.set(obj, texture);
      this.textures.push(texture);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // $FlowFixMe we are loosely on types here because we allow more that browser WebGL impl
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.mapInput ? this.mapInput(obj) : obj);
    return texture;
  }
}
