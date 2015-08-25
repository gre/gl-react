const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  blur1D: {
    frag: glslify(`${__dirname}/blur1D.frag`)
  }
});

class Blur1D extends GL.Component {
  render () {
    const { width, height, direction, children } = this.props;
    return <GL.View
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        resolution: [ width, height ]
      }}>
      <GL.Target uniform="t">{children}</GL.Target>
    </GL.View>;
  }
}

module.exports = Blur1D;
