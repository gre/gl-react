//@flow
import Exponent from "exponent";
import {TextureLoader} from "gl-react";
import type {DisposablePromise} from "gl-react/lib/helpers/disposable";
import createTexture from "gl-texture2d";

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
    const asset = Exponent.Asset.fromModule(module);
    const promise =
      Exponent.Asset.fromModule(module)
      .downloadAsync()
      .then(o => {
        if (ignored) return;
        const { gl } = this;
        const { width, height } = asset;
        const texture = createTexture(gl, [ width, height ]);
        console.log("texture...", texture.shape.slice(0))
        texture.setPixels({ raw: asset, width, height });
        console.log("raw", asset)
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
    console.log(module, this.textures.get(module));
    return this.textures.get(module);
  }
}
