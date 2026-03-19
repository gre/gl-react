export default function loseGL(gl: WebGLRenderingContext) {
  (gl.getExtension("STACKGL_destroy_context") as any).destroy();
}
