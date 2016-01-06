const React = require("react");
const invariant = require("invariant");
const Uniform = require("../Uniform");
const Shaders = require("../Shaders");
const TextureObjects = require("./TextureObjects");
const isNonSamplerUniformValue = require("./isNonSamplerUniformValue");
const findGLNodeInGLComponentChildren = require("./findGLNodeInGLComponentChildren");
const unifyPropsWithContext = require("./unifyPropsWithContext");
const invariantStrictPositive = require("./invariantStrictPositive");

//// build: converts the gl-react VDOM DSL into an internal data tree.

module.exports = function build (GLNode, context, parentPreload, via, surfaceId, decorateOnShaderCompile) {
  const props = GLNode.props;
  const shader = Shaders._resolve(props.shader, surfaceId, decorateOnShaderCompile(props.onShaderCompile));
  const GLNodeUniforms = props.uniforms;
  const {
    width,
    height,
    pixelRatio
  } = unifyPropsWithContext(props, context);
  const newContext = {
    width,
    height,
    pixelRatio
  };
  const GLNodeChildren = props.children;
  const preload = "preload" in props ? props.preload : parentPreload;

  invariant(Shaders.exists(shader), "Shader #%s does not exists", shader);

  const shaderName = Shaders.getName(shader);
  invariantStrictPositive(width, "GL Component ("+shaderName+"). width prop");
  invariantStrictPositive(height, "GL Component ("+shaderName+"). height prop");
  invariantStrictPositive(pixelRatio, "GL Component ("+shaderName+"). pixelRatio prop");

  const uniforms = { ...GLNodeUniforms };
  const children = [];
  const contents = [];

  React.Children.forEach(GLNodeChildren, child => {
    invariant(child.type === Uniform, "(Shader '%s') GL.Node can only contains children of type GL.Uniform. Got '%s'", shaderName, child.type && child.type.displayName || child);
    const { name, children, ...opts } = child.props;
    invariant(typeof name === "string" && name, "(Shader '%s') GL.Uniform must define an name String", shaderName);
    invariant(!GLNodeUniforms || !(name in GLNodeUniforms), "(Shader '%s') The uniform '%s' set by GL.Uniform must not be in {uniforms} props", shaderName);
    invariant(!(name in uniforms), "(Shader '%s') The uniform '%s' set by GL.Uniform must not be defined in another GL.Uniform", shaderName);
    uniforms[name] = !children || children.value ? children : { value: children, opts }; // eslint-disable-line no-undef
  });

  Object.keys(uniforms).forEach(name => {
    let value = uniforms[name];
    let nonSamplerUniformTyp = isNonSamplerUniformValue(value);
    if (nonSamplerUniformTyp) {
      if (process.env.NODE_ENV!=="production" && nonSamplerUniformTyp === "number[]") {
        let i = value.length;
        while (i-- > 0 && !isNaN(value[i]));
        invariant(i < 0, "Shader '%s': uniform '%s' must be an array of numbers. Found '%s' at index %s", shaderName, name, value[i], i);
      }
      return;
    }

    let opts, typ = typeof value;

    if (value && typ === "object" && !value.prototype && "value" in value) {
      // if value has a value field, we tread this field as the value, but keep opts in memory if provided
      if (typeof value.opts === "object") {
        opts = value.opts;
      }
      value = value.value;
      typ = typeof value;
    }

    if (!value) {
      // falsy value are accepted to indicate blank texture
      uniforms[name] = value;
    }
    else if (typ === "string") {
      // uri specified as a string
      uniforms[name] = TextureObjects.withOpts(TextureObjects.URI({ uri: value }), opts);
    }
    else if (typ === "object" && typeof value.uri === "string") {
      // uri specified in an object, we keep all other fields for RN "local" image use-case
      uniforms[name] = TextureObjects.withOpts(TextureObjects.URI(value), opts);
    }
    else if (typ === "object" && value.data && value.shape && value.stride) {
      // ndarray kind of texture
      uniforms[name] = TextureObjects.withOpts(TextureObjects.NDArray(value), opts);
    }
    else if(typ === "object" && (value instanceof Array ? React.isValidElement(value[0]) : React.isValidElement(value))) {
      // value is a VDOM or array of VDOM
      const res = findGLNodeInGLComponentChildren(value, newContext);
      if (res) {
        const { childGLNode, via } = res;
        // We have found a GL.Node children, we integrate it in the tree and recursively do the same

        children.push({
          vdom: value,
          uniform: name,
          data: build(childGLNode, newContext, preload, via, surfaceId, decorateOnShaderCompile)
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
    }
    else {
      // in any other case, it is an unrecognized invalid format
      delete uniforms[name];
      if (typeof console !== "undefined" && console.error) console.error("invalid uniform '"+name+"' value:", value); // eslint-disable-line no-console
      invariant(false, "Shader '%s': Unrecognized format for uniform '%s'", shaderName, name);
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
