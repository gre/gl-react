//@flow
import {NativeModules} from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
const {GLImagesModule} = NativeModules;

export type ImageSource = Object | number;
type ImageSourceHash = string | number;

let id = 1;
const cache: Map<ImageSourceHash, Promise<number>> = new Map();

function imageSourceHash (imageSource: ImageSource): ImageSourceHash {
  if (typeof imageSource === "number") return imageSource;
  const { uri } = imageSource;
  if (!uri) {
    throw new Error("GLImages: unsupported imageSource: {uri} needs to be defined");
  }
  return uri;
}

const load = (source: ImageSource): Promise<number> => {
  const hash = imageSourceHash(source);
  let promise = cache.get(hash);
  if (!promise) {
    promise = new Promise(success => {
      GLImagesModule.load(
        typeof source === "number"
        ? resolveAssetSource(source)
        : source,
        ++id,
        success
      );
    });
    cache.set(hash, promise);
  }
  return promise;
};

const unload = (id: number): void => {
  console.warn("GLImages.unload("+id+") not implemented");
};

export default {
  load,
  unload,
};
