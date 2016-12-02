//@flow
import {Texture2DLoader} from "gl-react";

export default class VideoTextureLoader extends Texture2DLoader<HTMLVideoElement> {
  canLoad (input: any) {
    return input instanceof HTMLVideoElement;
  }
  inferShape (canvas: HTMLVideoElement) {
    return [ canvas.videoWidth, canvas.videoHeight ];
  }
}
