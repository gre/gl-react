//@flow
import {TextureLoader} from "gl-react";
import type {DisposablePromise} from "gl-react/lib/helpers/disposable";
import GLImages from "./GLImages";
import type {ImageSource} from "./GLImages";

export default class ImageSourceTextureLoader extends TextureLoader<ImageSource> {
  loads: Array<DisposablePromise<*>> = [];
  textures: Map<number, *> = new Map();
  assetIdForImageSource: Map<ImageSource, number> = new Map();
  dispose() {
    this.loads.forEach(d => {
      d.dispose();
    });
    this.loads = [];
    const {gl} = this;
    this.textures.forEach(texture => {
      gl.deleteTexture(texture);
    });
    this.textures.clear();
  }
  canLoad (input: any) {
    return (
      typeof input==="number"
      || input && typeof input==="object" && typeof input.uri==="string"
    );
  }
  load (imageSource: ImageSource): DisposablePromise<*> {
    let ignored = false;
    let dispose = () => {
      ignored = true;
    };
    const promise = GLImages.load(imageSource).then((glAssetId: number) => {
      if (ignored) return;
      let texture;
      if (this.textures.has(glAssetId)) {
        texture = this.textures.get(glAssetId);
      }
      else {
        const { gl } = this;
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, { glAssetId });
        this.textures.set(glAssetId, texture);
      }
      this.assetIdForImageSource.set(imageSource, glAssetId);
      return texture;
    });
    const d = { dispose, promise };
    this.loads.push(d);
    return d;
  }
  get (imageSource: ImageSource) {
    const assetId = this.assetIdForImageSource.get(imageSource);
    return assetId && this.textures.get(assetId);
  }
}
