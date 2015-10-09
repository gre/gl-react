const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  blur1D: {
    frag: glslify(`${__dirname}/blur1D.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, direction, children }) =>
    <GL.View
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction,
        resolution: [ width, height ]
      }}>
      <GL.Uniform name="t">{children}</GL.Uniform>
    </GL.View>
, {
  displayName: "Blur1D"
});
