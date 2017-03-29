//@flow
import Expo from "expo";
import {TextureLoader} from "gl-react";
import type {DisposablePromise} from "gl-react/lib/helpers/disposable";

export default class ExponentTextureLoader extends TextureLoader<number> {
  loads: Map<number, DisposablePromise<*>> = new Map();
  textures: Map<number, *> = new Map();
  dispose() {
    const {loads} = this;
    loads.forEach(d => {
      d.dispose();
    });
    loads.clear();
  }
  canLoad (input: any) {
    if (typeof input==="number") return true; // RN module
  }
  load (module: number): DisposablePromise<*> {
    if (this.loads.has(module)) {
      return this.loads.get(module);
    }
    /* eslint-disable */
    let dispose = () => {};
    let ignored = false;
    const asset = Expo.Asset.fromModule(module);
    const promise =
      asset
      .downloadAsync()
      .then(o => {
        if (ignored) return;
        const { gl } = this;
        const { width, height } = asset;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, asset);
        this.textures.set(module, texture);
        this.loads.delete(module);
        return texture;
      });
    promise.then(res => console.log("res",res), e => console.error(e));
    const d = { dispose(){ ignored = true; }, promise };
    this.loads.set(module, d);
    return d;
  }
  get (module: number) {
    return this.textures.get(module);
  }
}
