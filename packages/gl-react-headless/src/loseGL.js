export default function loseGL(gl) {
  gl.getExtension("STACKGL_destroy_context").destroy();
}
