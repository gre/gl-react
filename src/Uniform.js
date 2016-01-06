const React = require("react");
const { Component, PropTypes } = React;
const invariant = require("invariant");

class Uniform extends Component {
  render () {
    invariant(
      false,
      "GL.Uniform elements are for GL.Node configuration only and should not be rendered"
    );
  }
}

Uniform.isGLUniform = true;

Uniform.displayName = "GL.Uniform";

Uniform.propTypes = {
  children: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired
};

module.exports = Uniform;
