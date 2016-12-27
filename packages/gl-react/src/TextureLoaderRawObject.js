//@flow
import TextureLoader from "./TextureLoader";
export default class TextureLoaderRawObject<T> extends TextureLoader<T> {
  textures: WeakMap<T, WebGLTexture>;
  +mapInput: (t: T)=>any;
  constructor(gl: WebGLRenderingContext) {
    super(gl);
    this.textures = new WeakMap();
  }
  dispose() {
    const {gl} = this;
    for (let k in this.textures) {
      if (this.textures.hasOwnProperty(k)) {
        gl.deleteTexture(this.textures[k]);
      }
    }
  }
  get (obj: T) {
    const { gl } = this;
    let texture = this.textures.get(obj);
    if (!texture) {
      texture = gl.createTexture();
      this.textures.set(obj, texture);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // $FlowFixMe we are loosely on types here because we allow more that browser WebGL impl
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.mapInput ? this.mapInput(obj) : obj);
    return texture;
  }
}
