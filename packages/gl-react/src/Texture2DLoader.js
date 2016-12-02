//@flow
import {disposeObjectMap} from "./helpers/disposable";
import createTexture from "gl-texture2d";
import type {Texture} from "gl-texture2d";
import TextureLoader from "./TextureLoader";

const identity = a => a;

export default class Texture2DLoader<T> extends TextureLoader<T> {
  textures: WeakMap<T, Texture>;
  +inferShape: ?(t: T) => [number, number];
  +mapTexture: ?(t: T) => any;
  constructor(gl: WebGLRenderingContext) {
    super(gl);
    this.textures = new WeakMap();
    // (^ we assume you have included polyfill like babel-polyfill if you want to support older browsers)
  }
  dispose() {
    disposeObjectMap(this.textures);
  }
  get (t: T) {
    const { inferShape } = this;
    let texture = this.textures.get(t);
    const shape = inferShape ? inferShape(t) : null;
    if (shape && (!shape[0] || !shape[1])) return null; // not yet ready
    const mapTexture = this.mapTexture || identity;
    if (!texture) {
      texture = createTexture(this.gl, shape ? shape : mapTexture(t));
      this.textures.set(t, texture);
    }
    if (shape && (shape[0]!==texture.shape[0] || shape[1]!==texture.shape[1])) {
      texture.shape = shape;
    }
    // we assume we always have to sync canvas texture
    texture.setPixels(mapTexture(t));
    return texture;
  }
}
