const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  mix: {
    frag: glslify(`${__dirname}/mix.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, color, map, factor, children }) =>
  <GL.View
    shader={shaders.mix}
    width={width}
    height={height}
    uniforms={{
      color,
      map,
      factor
    }}>
    <GL.Uniform name="t">{children}</GL.Uniform>
  </GL.View>,
  {
    displayName: "Mix"
  }
);
