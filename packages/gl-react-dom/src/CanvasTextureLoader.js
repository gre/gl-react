//@flow
import {TextureLoaderRawObject} from "gl-react";
export default class CanvasTextureLoader extends TextureLoaderRawObject<HTMLCanvasElement> {
  canLoad (input: any) {
    return input instanceof HTMLCanvasElement;
  }
}
