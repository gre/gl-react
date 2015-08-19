const invariant = require("invariant");
const { Component, PropTypes } = require("react");

class Target extends Component {
  render () {
    invariant(
      false,
      "GL.Target elements are for GL.View configuration only and should not be rendered"
    );
  }
}
Target.displayName = "GL.Target";
Target.propTypes = {
  children: PropTypes.any.isRequired,
  uniform: PropTypes.string.isRequired
};

module.exports = Target;
