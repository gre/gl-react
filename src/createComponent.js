const React = require("./react-runtime");
const invariant = require("invariant");
const unifyPropsWithContext = require("./data/unifyPropsWithContext");

module.exports = function createComponent (renderGLNode, staticFields) {

  invariant(typeof renderGLNode === "function",
  "GL.createComponent(props => glnode) must have a function in parameter");

  class GLComponent extends React.Component {
    render () {
      const glNode = renderGLNode(unifyPropsWithContext(this.props, this.context));

      invariant(glNode && glNode.type && (glNode.type.isGLNode || glNode.type.isGLComponent),
      "%s: The GL.createComponent function parameter must return a GL.Node or "+
      "another GL Component", GLComponent.displayName);

      return glNode;
    }
  }

  GLComponent.isGLComponent = true;

  GLComponent.displayName = renderGLNode.name || "";

  if (staticFields) {
    invariant(typeof staticFields === "object",
    "second parameter of createComponent must be an object of static fields "+
    "to set in the React component. (example: propTypes, displayName)");

    for (let key in staticFields) {
      GLComponent[key] = staticFields[key];
    }
  }

  return GLComponent;
};
