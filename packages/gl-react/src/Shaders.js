//@flow
import invariant from "invariant";
import GLSL from "./GLSL";
import type { GLSLCode } from "./GLSL";

const ShaderID = "ShaderID";

/**
 * An object that contains a `frag` GLSLCode.
 * @example
 *  {
 *    frag: GLSL`...`
 *  }
 */
type ShaderDefinition = {|
  frag: GLSLCode,
  vert?: GLSLCode,
|};

export type { ShaderDefinition };

/**
 *
 */
type ShaderIdentifier = {
  type: typeof ShaderID,
  id: string,
};

export type { ShaderIdentifier };

type ShaderIdentifierMap<T> = {
  [key: string]: T,
};

/**
 * An object map from a key string to a **ShaderDefinition**.
 * @example
 *  {
 *    helloGL: {
 *      frag: GLSL`...`
 *    }
 *  }
 */
type ShadersDefinition = {
  [key: string]: ShaderDefinition,
};

/**
 * An object map from a key string to a **ShaderIdentifier** that you can pass to `<Node shader>`
 */
type ShadersSheet<S: ShadersDefinition> = {
  [key: $Keys<S>]: ShaderIdentifier,
};

type ShaderInfo = {
  frag: GLSLCode,
  vert: GLSLCode,
};

export type { ShaderInfo };

const shaderDefinitions: ShaderIdentifierMap<ShaderDefinition> = {};
const shaderNames: ShaderIdentifierMap<string> = {};
const shaderResults: ShaderIdentifierMap<ShaderInfo> = {};

const genShaderId = ((i) => () => (++i).toString())(0);

const staticVert = GLSL`
attribute vec2 _p;
varying vec2 uv;
void main() {
gl_Position = vec4(_p,0.0,1.0);
uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}`;

export function isShaderIdentifier(shaderIdentifier: mixed): boolean {
  return (
    typeof shaderIdentifier === "object" &&
    !!shaderIdentifier &&
    shaderIdentifier.type === ShaderID &&
    typeof shaderIdentifier.id === "string"
  );
}

export function ensureShaderDefinition(
  definition: any,
  ctx?: string = ""
): ShaderDefinition {
  invariant(
    definition && typeof definition.frag === "string",
    "A `frag` GLSL code (string) is required" + ctx
  );
  return definition;
}

export function shaderDefinitionToShaderInfo(
  definition: ShaderDefinition
): ShaderInfo {
  return {
    frag: definition.frag,
    vert: definition.vert || staticVert, // FIXME this is somewhat experimental for now, vert implement needs to expect a _p attribute
  };
}

export function shaderInfoEquals(s1: ShaderInfo, s2: ShaderInfo): boolean {
  return s1.frag === s2.frag && s1.vert === s2.vert;
}

/**
 * Define shaders statically.
 * @namespace
 */
const Shaders = (global.__glReactShaders = global.__glReactShaders || {
  /**
   * @memberof Shaders
   * @param {ShadersDefinition} shadersDef - an object that statically define all shaders.
   * @returns {ShadersSheet}, an object map that returns a ShaderIdentifier for each shader key defined in the shaders definition.
   * @example
   *  const shaders = Shaders.create({
   *    helloGL: {
   *      frag: GLSL`...`
   *    }
   *  });
   *  ...
   *  <Node shader={shaders.helloGL} />
   */
  create<S: ShadersDefinition>(shadersDef: S): ShadersSheet<S> {
    const sheet = {};
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
      const result = shaderDefinitionToShaderInfo(definition);
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
