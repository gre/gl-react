export const GLSLSymbol = "GLSL";

/**
 * object created by **GLSL``** string template
 */
export type GLSLCode = string;

/**
 * GLSL string template to write your shader.
 */
export default function GLSL(
  strings: TemplateStringsArray,
  ...values: string[]
): GLSLCode {
  let code = "";
  for (let i = 0; i < strings.length; i++) {
    code += (i === 0 ? "" : values[i - 1]) + strings[i];
  }
  return code;
}
