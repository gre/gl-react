declare module "gl" {
  function createGL(
    width: number,
    height: number,
    opts?: Record<string, any>
  ): WebGLRenderingContext;
  export default createGL;
}
