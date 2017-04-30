//@flow
export const GLSLSymbol = "GLSL";

/**
 * object created by **GLSL``** string template
 */
type GLSLCode = string;
export type { GLSLCode };

/**
 * GLSL string template to write your shader.
 * The library use a string template for esthetic reason (e.g. syntax color support) but also so we can more strongly type things.
 * Note that later, we might do static analysis to generate at compile time the uniform types for instance.
 * See [GLSL spec](http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf).
 *
 * @return {GLSLCode}, an object you can give to `Shaders.create`'s `frag`.
 * @example
 * GLSL`
 * precision highp float;
 * varying vec2 uv;
 * void main() {
 *   gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
 * }
 * `
 */
export default function GLSL(
  strings: Array<string>,
  ...values: Array<string>
): GLSLCode {
  let code = "";
  for (let i = 0; i < strings.length; i++) {
    code += (i === 0 ? "" : values[i - 1]) + strings[i];
  }
  return code;
}
