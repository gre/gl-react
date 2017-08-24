//@flow
import { TextureLoader } from "gl-react";
import type { DisposablePromise } from "gl-react/lib/helpers/disposable";

type ImageSource = Object | "number";
type ImageSourceHash = string | number;
type Asset = { texture: WebGLTexture, width: number, height: number };

function imageSourceHash(imageSource: ImageSource): ImageSourceHash {
  if (typeof imageSource === "number") return imageSource;
  const { uri } = imageSource;
  if (!uri) {
    throw new Error(
      "GLImages: unsupported imageSource: {uri} needs to be defined"
    );
  }
  return uri;
}

export default class ImageSourceTextureLoader extends TextureLoader<
  ImageSource
> {
  loads: Map<*, DisposablePromise<WebGLTexture>> = new Map();
  textureAssets: Map<*, Asset> = new Map();
  dispose() {
    this.loads.forEach(d => {
      d.dispose();
    });
    this.loads.clear();
    const { gl } = this;
    const rngl = gl.getExtension("RN");
    this.textureAssets.forEach(({ texture }) => {
      rngl.unloadTexture(texture);
    });
    this.textureAssets.clear();
  }

  canLoad(input: any) {
    return (
      typeof input === "number" ||
      (input && typeof input === "object" && typeof input.uri === "string")
    );
  }

  load(imageSource: ImageSource): DisposablePromise<*> {
    const hash = imageSourceHash(imageSource);
    const load = this.loads.get(hash);
    if (load) return load;
    let ignored = false;
    let dispose = () => {
      ignored = true;
    };
    const promise = this.gl
      .getExtension("RN")
      .loadTexture({ yflip: true, image: imageSource })
      .then(data => {
        this.textureAssets.set(hash, data);
        return data.texture;
      });
    const d = { dispose, promise };
    this.loads.set(hash, d);
    return d;
  }
  get(imageSource: ImageSource) {
    const asset = this.textureAssets.get(imageSourceHash(imageSource));
    return asset && asset.texture;
  }
  getSize(imageSource: ImageSource) {
    const asset = this.textureAssets.get(imageSourceHash(imageSource));
    if (!asset) return;
    return [asset.width, asset.height];
  }
}
