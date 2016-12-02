//@flow
import Texture2DLoader from "./Texture2DLoader";
import type {NDArray} from "ndarray";

export default class TextureLoaderNDArray extends Texture2DLoader<NDArray> {
  canLoad (obj: *) {
    return (
      obj.shape &&
      obj.data &&
      obj.stride
    );
  }
}
