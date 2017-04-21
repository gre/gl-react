//@flow
import LRU from "lru";
import {NativeModules} from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
const {GLImagesModule} = NativeModules;

export type ImageSource = Object | number;
type ImageSourceHash = string | number;

let id = 1;
const cache = new LRU(50);

cache.on("evict", ({ value }) => {
  value.then(id => GLImagesModule.unload(id));
});

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

export default {
  load,
};
