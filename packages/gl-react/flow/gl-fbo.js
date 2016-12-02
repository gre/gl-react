//@flow

import type {Texture} from "gl-texture2d";

declare module "gl-fbo" {  
  /**
   * @private
   * from gl-fbo
   */
  declare type Framebuffer = {|
    bind:() => void,
    dispose:()=>void,
    color: [Texture],
    shape: [number, number],
  |};
  declare var exports: (gl: WebGLRenderingContext, shape: [number, number])=>Framebuffer
}
