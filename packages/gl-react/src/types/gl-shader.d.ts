declare module "gl-shader" {
  export interface Shader {
    bind(): void;
    dispose(): void;
    uniforms: { [key: string]: any };
    attributes: { [key: string]: any };
    types: {
      uniforms: { [key: string]: string | string[] };
    };
  }
  function createShader(
    gl: WebGLRenderingContext,
    vert: string,
    frag: string
  ): Shader;
  export default createShader;
}
