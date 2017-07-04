//@flow
import { NativeModules, Image } from "react-native";
import Expo from "expo";
import { TextureLoader } from "gl-react";
import type { DisposablePromise } from "gl-react/lib/helpers/disposable";

function hash(obj) {
  return JSON.stringify(obj); // FIXME ikr XD
}

export default class ExponentGLObjectTextureLoader extends TextureLoader<
  Object
> {
  loads: Map<string, DisposablePromise<*>> = new Map();
  textures: Map<string, *> = new Map();
  dispose() {}
  canLoad(input: any) {
    if (
      !NativeModules.ExponentGLObjectManager ||
      !NativeModules.ExponentGLObjectManager.createObjectAsync
    ) {
      return false;
    }
    return input && typeof input === "object" && input.camera;
  }
  load(texture: Object): DisposablePromise<*> {
    const key = hash(texture);
    const load = this.loads.get(key);
    if (load) return load;
    const { gl } = this;
    // $FlowFixMe
    const { __exglCtxId: exglCtxId } = gl;
    let disposed = false;
    const d = {
      dispose: () => {
        disposed = true;
      },
      promise: NativeModules.ExponentGLObjectManager
        .createObjectAsync({
          exglCtxId,
          texture,
        })
        .then(({ exglObjId }) => {
          if (disposed) return;
          const webglTexture = new WebGLTexture(exglObjId);
          this.textures.set(key, webglTexture);
          return webglTexture;
        }),
    };
    this.loads.set(key, d);
    return d;
  }
  get(texture: Object) {
    return this.textures.get(hash(texture));
  }
}
