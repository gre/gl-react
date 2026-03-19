import invariant from "invariant";
import GLSL from "./GLSL";
import type { GLSLCode } from "./GLSL";

const ShaderID = "ShaderID";

/**
 * An object that contains a `frag` GLSLCode.
 */
export interface ShaderDefinition {
  frag: GLSLCode;
  vert?: GLSLCode;
}

export interface ShaderIdentifier {
  type: typeof ShaderID;
  id: string;
}

type ShaderIdentifierMap<T> = {
  [key: string]: T;
};

/**
 * An object map from a key string to a **ShaderDefinition**.
 */
type ShadersDefinition = {
  [key: string]: ShaderDefinition;
};

/**
 * An object map from a key string to a **ShaderIdentifier** that you can pass to `<Node shader>`
 */
type ShadersSheet<S extends ShadersDefinition> = {
  [K in keyof S]: ShaderIdentifier;
};

export interface ShaderInfo {
  frag: GLSLCode;
  vert: GLSLCode;
}

const shaderDefinitions: ShaderIdentifierMap<ShaderDefinition> = {};
const shaderNames: ShaderIdentifierMap<string> = {};
const shaderResults: ShaderIdentifierMap<ShaderInfo> = {};

const genShaderId = ((i: number) => () => (++i).toString())(0);

const staticVerts: { [key: string]: string } = {
  "100": GLSL`
attribute vec2 _p;
varying vec2 uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`,
  "300 es": GLSL`#version 300 es
in vec2 _p;
out vec2 uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`,
};

export function isShaderIdentifier(shaderIdentifier: unknown): boolean {
  return (
    typeof shaderIdentifier === "object" &&
    !!shaderIdentifier &&
    (shaderIdentifier as any).type === ShaderID &&
    typeof (shaderIdentifier as any).id === "string"
  );
}

export function ensureShaderDefinition(
  definition: any,
  ctx: string = ""
): ShaderDefinition {
  invariant(
    definition && typeof definition.frag === "string",
    "A `frag` GLSL code (string) is required" + ctx
  );
  return definition;
}

const versionDef = "#version";
function inferGLSLVersion(glsl: string): string {
  const i = glsl.indexOf("\n");
  const line1 = i > -1 ? glsl.slice(0, i) : glsl;
  if (line1.startsWith(versionDef)) {
    return line1.slice(versionDef.length + 1);
  }
  return "100";
}

const addGLSLName = (glsl: string, name: string | null | undefined) =>
  !name ? glsl : glsl + "\n#define SHADER_NAME " + name + "\n";

export function shaderDefinitionToShaderInfo(
  { frag, vert }: ShaderDefinition,
  name: string
): ShaderInfo {
  frag = frag.trim();
  const version = inferGLSLVersion(frag);
  if (vert) {
    vert = vert.trim();
    const vertVersion = inferGLSLVersion(vert);
    if (version !== vertVersion) {
      throw new Error("GLSL shader vert and frag version must match");
    }
  } else {
    vert = staticVerts[version];
    if (!vert) {
      throw new Error(
        "gl-react: could not find static vertex shader for GLSL version '" +
          version +
          "'"
      );
    }
  }
  frag = addGLSLName(frag, name);
  vert = addGLSLName(vert, name);
  return {
    frag,
    vert,
  };
}

export function shaderInfoEquals(s1: ShaderInfo, s2: ShaderInfo): boolean {
  return s1.frag === s2.frag && s1.vert === s2.vert;
}

const g = global as any;

/**
 * Define shaders statically.
 * @namespace
 */
const Shaders = (g.__glReactShaders = g.__glReactShaders || {
  create<S extends ShadersDefinition>(shadersDef: S): ShadersSheet<S> {
    const sheet: any = {};
    Object.keys(shadersDef).forEach((k) => {
      const definition = ensureShaderDefinition(
        shadersDef[k],
        " in Shaders.create({ " + k + ": ... })"
      );
      const id = genShaderId();
      const shaderId = Object.freeze({ type: ShaderID, id });
      shaderDefinitions[id] = definition;
      shaderNames[id] = k;
      sheet[k] = shaderId;
      const result = shaderDefinitionToShaderInfo(definition, k);
      shaderResults[id] = result;
    });
    return sheet;
  },
  getName(shaderIdentifier: ShaderIdentifier): string {
    return (
      (shaderNames[shaderIdentifier.id] || "???") +
      `#${String(shaderIdentifier.id)}`
    );
  },
  getShortName(shaderIdentifier: ShaderIdentifier): string {
    return shaderNames[shaderIdentifier.id] || "???";
  },
  get(shaderIdentifier: ShaderIdentifier): ShaderInfo {
    invariant(
      shaderIdentifier.id in shaderDefinitions,
      "Shader %s does not exist. Make sure you don't have gl-react dup issue: `npm ls gl-react`",
      shaderIdentifier.id
    );
    return shaderResults[shaderIdentifier.id];
  },
});
export default Shaders;
