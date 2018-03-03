//@flow

declare module "gl-shader" {
  /**
  * @private
  * from gl-shader
  */
  declare type Shader = {|
    bind:() => void,
    dispose:()=>void,
    uniforms: { [key:string]: any },
    attributes: { [key:string]: any },
    types: {
      uniforms: { [key:string]: string|Array<string> },
    },
  |};
  declare module.exports: (gl: WebGLRenderingContext, vert: string, frag: string) => Shader
}
