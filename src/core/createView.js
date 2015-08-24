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

module.exports = function (React, Shaders, Target, renderVcontainer, renderVtarget, renderVGL) {
  const {
    Component,
    PropTypes
  } = React;

  class GLView extends Component {
    render() {
      const props = this.props;
      const { style, width, height, children, shader, uniforms: uniformsOriginal } = props;
      const cleanedProps = { ...props };
      delete cleanedProps.style;
      delete cleanedProps.width;
      delete cleanedProps.height;
      delete cleanedProps.shader;
      delete cleanedProps.uniforms;
      delete cleanedProps.children;

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
        children: []
      };

      let targetId = 0;
      let targets = [];
      React.Children.forEach(children, child => {
        invariant(child.type === Target, "GL.View can only contains children of type GL.Target. Got '%s'", child.type && child.type.displayName || child);
        const { uniform, children, style } = child.props;
        invariant(typeof uniform === "string" && uniform, "GL.Target must define an uniform String.");
        invariant(!(uniform in uniforms), "The uniform '%s' set by GL.Target is already defined in {uniforms} props");
        if (children && !React.isValidElement(children)) {
          uniforms[uniform] = textureFromImage(children);
        }
        else {
          const target = React.Children.only(children);
          // TODO: we need to determine if target is directly a GLView and recursively do this children loop logic
          const id = targetId ++;
          uniforms[uniform] = textureFromTarget(id);
          targets.push(renderVtarget(style, width, height, id, target));
        }
      });

      return renderVcontainer(
        style,
        width,
        height,
        targets,
        renderVGL(
          cleanedProps,
          width,
          height,
          data)
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
