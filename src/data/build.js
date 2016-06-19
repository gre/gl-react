const React = require("react");
const invariant = require("invariant");
const Uniform = require("../Uniform");
const Shaders = require("../Shaders");
const TextureObjects = require("./TextureObjects");
const duckTypeUniformValue = require("./duckTypeUniformValue");
const findGLNodeInGLComponentChildren = require("./findGLNodeInGLComponentChildren");
const invariantStrictPositive = require("./invariantStrictPositive");
import runtime from "../runtime";

//// build: converts the gl-react VDOM DSL into an internal data tree.

module.exports = function build (
  glNode,
  context,
  parentPreload,
  via,
  surfaceId,
  decorateOnShaderCompile
) {
  const props = glNode.props;
  const shader = Shaders._resolve(props.shader, surfaceId, decorateOnShaderCompile(props.onShaderCompile));
  const glNodeUniforms = props.uniforms;
  const {
    width,
    height,
    pixelRatio
  } = { ...context, ...props };
  const newContext = {
    width,
    height,
    pixelRatio
  };
  const glNodeChildren = props.children;
  const preload = "preload" in props ? props.preload : parentPreload;

  invariant(Shaders.exists(shader), "Shader #%s does not exists", shader);

  const shaderName = Shaders.get(shader).name;
  invariantStrictPositive(pixelRatio, "GL Component ("+shaderName+"). pixelRatio prop");

  const uniforms = { ...glNodeUniforms };
  const children = [];
  const contents = [];

  React.Children.forEach(glNodeChildren, child => {
    invariant(child.type === Uniform, "(Shader '%s') GL.Node can only contains children of type GL.Uniform. Got '%s'", shaderName, child.type && child.type.displayName || child);
    const { name, children, ...opts } = child.props;
    invariant(typeof name === "string" && name, "(Shader '%s') GL.Uniform must define an name String", shaderName);
    invariant(!glNodeUniforms || !(name in glNodeUniforms), "(Shader '%s') The uniform '%s' set by GL.Uniform must not be in {uniforms} props", shaderName);
    invariant(!(name in uniforms), "(Shader '%s') The uniform '%s' set by GL.Uniform must not be defined in another GL.Uniform", shaderName);
    uniforms[name] = !children || children.value ? children : { value: children, opts }; // eslint-disable-line no-undef
  });

  Object.keys(uniforms).forEach(name => {
    let value = uniforms[name], opts;
    if (value && typeof value === "object" && !value.prototype && "value" in value) {
      // if value has a value field, we tread this field as the value, but keep opts in memory if provided
      if (typeof value.opts === "object") {
        opts = value.opts;
      }
      value = value.value;
    }

    value = runtime.decorateUniformValue(value);

    try {
      switch (duckTypeUniformValue(value)) {

      case "string": // uri specified as a string
        uniforms[name] = TextureObjects.withOpts(TextureObjects.URI({ uri: value }), opts);
        break;

      case "{uri}": // uri specified in an object, we keep all other fields for RN "local" image use-case
        uniforms[name] = TextureObjects.withOpts(TextureObjects.URI(value), opts);
        break;

      case "ndarray":
        uniforms[name] = TextureObjects.withOpts(TextureObjects.NDArray(value), opts);
        break;

      case "vdom[]":
      case "vdom": {
        const res = findGLNodeInGLComponentChildren(value, newContext);
        if (res) {
          const { childGLNode, via, context } = res;
          // We have found a GL.Node children, we integrate it in the tree and recursively do the same
          children.push({
            vdom: value,
            uniform: name,
            data: build(childGLNode, context, preload, via, surfaceId, decorateOnShaderCompile)
          });
        }
        else {
          // in other cases VDOM, we will use child as a content
          contents.push({
            vdom: value,
            uniform: name,
            opts
          });
        }
        break;
      }

      default:
        // Remaining cases will just set the value without further transformation
        uniforms[name] = value;
      }
    }
    catch (e) {
      delete uniforms[name];
      const message = "Shader '"+shaderName+"': uniform '"+name+"' "+e.message;
      if (process.env.NODE_ENV !== "production")
        console.error(message, value); // eslint-disable-line no-console
      throw new Error(message);
    }
  });

  return {
    shader,
    uniforms,
    width,
    height,
    pixelRatio,
    children,
    contents,
    preload,
    via
  };
};
