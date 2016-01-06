const React = require("react");
const { Component, PropTypes } = React;
const invariant = require("invariant");

class Node extends Component {
  render () {
    invariant(
      false,
      "GL.Node elements can only be used as children of GL.Surface / GL.Node and should not be rendered"
    );
  }
}

Node.isGLNode = true;

Node.displayName = "GL.Node";

Node.propTypes = {
  shader: PropTypes.any.isRequired,
  uniforms: PropTypes.object,
  children: PropTypes.node,
  width: PropTypes.number,
  height: PropTypes.number,
  preload: PropTypes.bool
};

module.exports = Node;
