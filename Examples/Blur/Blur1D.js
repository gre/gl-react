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
    const { width, height, direction, minBlur, maxBlur, blurMap, offset, children } = this.props;
    return <GL.View
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        minBlur,
        maxBlur,
        blurMap,
        offset,
        resolution: [ width, height ]
      }}>
      <GL.Uniform name="t">{children}</GL.Uniform>
    </GL.View>;
  }
}

module.exports = Blur1D;
