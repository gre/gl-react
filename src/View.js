const invariant = require("invariant");
const React = require("react");
const {
  Component,
  PropTypes
} = React;
const Shaders = require("./Shaders");
const Target = require("./Target");
const GLCanvas = require("./GLCanvas");

class GLView extends Component {

  constructor (props, context) {
    super(props, context);
    this.getDrawingTarget = this.getDrawingTarget.bind(this);
  }

  getDrawingTarget (name) {
    return React.findDOMNode(this.refs["uniform-"+name]).firstChild;
  }

  render() {
    const props = this.props;
    const { style, width, height, children, shader } = props;

    invariant(Shaders.exists(shader), "Shader #%s does not exists", shader);

    if (children) {
      const parentStyle = {
        ...style,
        position: "relative",
        width: width+"px",
        height: height+"px",
        overflow: "hidden"
      };
      const childrenStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: width+"px",
        height: height+"px",
        visibility: "hidden"
      };

      const targetUniforms = [];
      const targets = React.Children.map(children, child => {
        invariant(child.type === Target, "GL.View can only contains children of type GL.Target. Got '%s'", child.type && child.type.displayName || child);
        const uniform = child.props.uniform;
        targetUniforms.push(uniform);
        const target = React.Children.only(child.props.children);
        return <div ref={"uniform-"+uniform} style={{ ...childrenStyle, ...child.props.style }}>{target}</div>;
      });
      return <div style={parentStyle}>
        {targets}
        <GLCanvas
          {...props}
          children={undefined}
          targetUniforms={targetUniforms}
          getDrawingTarget={this.getDrawingTarget}
        />
      </div>;
    }
    else {
      return <GLCanvas {...props} style={style} />;
    }
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

module.exports = GLView;
