//@flow
import { TextureLoaderRawObject } from "gl-react";

export default class VideoTextureLoader extends TextureLoaderRawObject<
  HTMLVideoElement
> {
  canLoad(input: any) {
    return input instanceof HTMLVideoElement;
  }
  mapInput(video: HTMLVideoElement) {
    if (video.videoWidth === 0) return null;
    return video;
  }
}
