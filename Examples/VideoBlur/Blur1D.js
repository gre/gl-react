const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const {
  PropTypes
} = React;

const shaders = GL.Shaders.create({
  blur1D: {
    frag: glslify(`${__dirname}/blur1D.frag`)
  }
});

class Blur1D extends GL.Component {
  render () {
    const { width, height, direction, children: t, ...rest } = this.props;
    return <GL.View
      {...rest}
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        resolution: [ width, height ],
        t
      }}
    />;
  }
}

Blur1D.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  direction: PropTypes.array.isRequired,
  children: PropTypes.any.isRequired
};

module.exports = Blur1D;
