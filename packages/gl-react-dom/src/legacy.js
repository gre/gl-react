
import {TextureLoaders} from "gl-react";
import ImageTextureLoader from "./ImageTextureLoader";

class DeprecatedUriImageTextureLoader extends ImageTextureLoader {
  canLoad(obj: any) {
    return typeof obj==="object" && typeof obj.uri === "string";
  }
  get(obj: any) {
    return super.get(obj.uri);
  }
  load(obj: any) {
    console.warn("gl-react-dom: usage of {uri} format in texture uniform is deprecated. Directly give an image URL instead.");
    return super.load(obj.uri);
  }
}

TextureLoaders.add(
  DeprecatedUriImageTextureLoader
);
