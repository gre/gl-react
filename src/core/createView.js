const invariant = require("invariant");

function textureFromTarget (targetId) {
  return { type: "target", id: targetId };
}

function textureFromImage (srcOrObj) {
  if (typeof srcOrObj === "string")
    srcOrObj = { uri: srcOrObj };
  return { type: "image", value: srcOrObj };
}

function textureFromFramebuffer (fbId) {
  return { type: "framebuffer", id: fbId };
}

module.exports = function (React, Shaders, Target, GLComponent, renderVcontainer, renderVtarget, renderVGL) {
  const {
    Component,
    PropTypes
  } = React;

  function reactFirstChildOnly (children) {
    return React.Children.count(children) === 1 ?
      (children instanceof Array ? children[0] : children) :
      null;
  }

  // buildData traverses the children, add elements to targets array and returns a data object
  function buildData (shader, uniformsOriginal, width, height, children, targets) {
    invariant(Shaders.exists(shader), "Shader #%s does not exists", shader);
    const uniforms = {};
    for (const key in uniformsOriginal) {
      let value = uniformsOriginal[key];
      // filter out the texture types...
      if (typeof value === "string" || typeof value === "object" && !(value instanceof Array))
        value = textureFromImage(value);
      uniforms[key] = value;
    }

    const data = {
      shader,
      uniforms,
      width,
      height,
      children: []
    };

    React.Children.forEach(children, child => {
      invariant(child.type === Target, "GL.View can only contains children of type GL.Target. Got '%s'", child.type && child.type.displayName || child);
      const { uniform, children, style } = child.props;
      invariant(typeof uniform === "string" && uniform, "GL.Target must define an uniform String.");
      invariant(!(uniform in data.uniforms), "The uniform '%s' set by GL.Target is already defined in {uniforms} props");
      const onlyChild = reactFirstChildOnly(children);
      if (onlyChild) {
        if (!React.isValidElement(onlyChild)) {
          data.uniforms[uniform] = textureFromImage(onlyChild);
          return;
        }
        else {
          let childGLView;

          // Recursively unfold the children while there are GLComponent and not a GLView
          let c = onlyChild;
          do {
            if (c.type === GLView) {
              childGLView = c;
              break;
            }
            const instance = new c.type();
            instance.props = c.props;
            c = reactFirstChildOnly(instance.render());
            if (c.type === GLView) {
              childGLView = c;
              break;
            }
          }
          while(c && typeof c.type === "function" && c.type.prototype instanceof GLComponent);

          if (childGLView) {
            const id = data.children.length;
            const { shader, uniforms, children } = childGLView.props;
            const dataChild = buildData(shader, uniforms, width, height, children, targets);
            data.children.push(dataChild);
            data.uniforms[uniform] = textureFromFramebuffer(id);
            return;
          }
        }
      }

      // in other cases, we will use child as a target
      const id = targets.length;
      data.uniforms[uniform] = textureFromTarget(id);
      targets.push(renderVtarget(style, width, height, id, children));
    });

    return data;
  }

  class GLView extends Component {
    render() {
      const props = this.props;
      const { style, width, height, children, shader, uniforms } = props;
      const cleanedProps = { ...props };
      delete cleanedProps.style;
      delete cleanedProps.width;
      delete cleanedProps.height;
      delete cleanedProps.shader;
      delete cleanedProps.uniforms;
      delete cleanedProps.children;

      const targets = [];
      const data = buildData(shader, uniforms, width, height, children, targets);

      return renderVcontainer(
        style,
        width,
        height,
        targets,
        renderVGL(
          cleanedProps,
          width,
          height,
          data,
          targets.length)
      );
    }
  }

  GLView.displayName = "GL.View";
  GLView.propTypes = {
    shader: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    uniforms: PropTypes.object,
    opaque: PropTypes.bool
  };
  GLView.defaultProps = {
    opaque: true
  };

  return GLView;
};
