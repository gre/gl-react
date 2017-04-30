//@flow
import { NativeModules, Image } from "react-native";
import Expo from "expo";
import { TextureLoader } from "gl-react";
import type { DisposablePromise } from "gl-react/lib/helpers/disposable";
import md5 from "./md5";

type Asset = {
  width: number,
  height: number,
  uri: string,
  localUri: string,
};

const hash = (module: number | { uri: string }) =>
  (typeof module === "number" ? module : module.uri);

const localAsset = (module: number) => {
  const asset = Expo.Asset.fromModule(module);
  return asset.downloadAsync().then(() => asset);
};

const remoteAssetCache = {};

const remoteAsset = (uri: string) => {
  const i = uri.lastIndexOf(".");
  const ext = i !== -1 ? uri.slice(i) : ".jpg";
  const key = md5(uri);
  if (key in remoteAssetCache) {
    return Promise.resolve(remoteAssetCache[key]);
  }
  const promise = Promise.all([
    new Promise((success, failure) =>
      Image.getSize(
        { uri },
        (width, height) => success({ width, height }),
        failure
      )
    ),
    NativeModules.ExponentFileSystem.downloadAsync(
      uri,
      `ExponentAsset-${key}${ext}`,
      {
        cache: true,
      }
    ),
  ]).then(([size, asset]) => ({ ...size, uri, localUri: asset.uri }));
  remoteAssetCache[key] = promise;
  return promise;
};

export const loadAsset = (module: number | { uri: string }): Promise<Asset> =>
  (typeof module === "number" ? localAsset(module) : remoteAsset(module.uri));

export default class ExponentTextureLoader extends TextureLoader<*> {
  loads: Map<number | string, DisposablePromise<*>> = new Map();
  textures: Map<number | string, *> = new Map();
  dispose() {
    const { loads } = this;
    loads.forEach(d => {
      d.dispose();
    });
    loads.clear();
  }
  canLoad(input: any) {
    return (
      typeof input === "number" ||
      (input && typeof input === "object" && typeof input.uri === "string")
    );
  }
  load(module: number | { uri: string }): DisposablePromise<*> {
    const key = hash(module);
    if (this.loads.has(key)) {
      return this.loads.get(key);
    }
    let dispose = () => {};
    let ignored = false;
    const promise = loadAsset(module).then(asset => {
      if (ignored) return;
      const { gl } = this;
      const { width, height } = asset;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        asset
      );
      this.textures.set(key, texture);
      this.loads.delete(key);
      return texture;
    });
    const d = {
      dispose() {
        ignored = true;
      },
      promise,
    };
    this.loads.set(key, d);
    return d;
  }
  get(module: number) {
    return this.textures.get(hash(module));
  }
}
