const React = require("react");
const GL = require("gl-react-core");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  blur1D: {
    frag: glslify(`${__dirname}/blur1D.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, direction, minBlur, maxBlur, blurMap, offset, children }) =>
  <GL.Node
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
  </GL.Node>,
  { displayName: "Blur1D" });
