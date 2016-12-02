//@flow
import {Texture2DLoader} from "gl-react";

export default class CanvasTextureLoader extends Texture2DLoader<HTMLCanvasElement> {
  canLoad (input: any) {
    return input instanceof HTMLCanvasElement;
  }
  inferShape (canvas: HTMLCanvasElement) {
    return [ canvas.width, canvas.height ];
  }
}
