//@flow

/**
 * This type is provided by the library [gl-texture2d](https://github.com/stackgl/gl-texture2d).
 * @type Texture
 */
type Texture = {|
  dispose:()=>void,
  setPixels: (d:any)=>void,
  bind: (unit: number) => number,
  minFilter: number,
  magFilter: number,
  wrap: [number, number],
  shape: [number, number],
|}

declare module "gl-texture2d" {
  declare type Texture = Texture;
  declare var exports: (gl: WebGLRenderingContext, o: any)=>Texture
}
