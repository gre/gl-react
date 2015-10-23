const React = require("react");
const GL = require("gl-react-core");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  hueRotate: {
    frag: glslify(`${__dirname}/hueRotate.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, hue, children: tex }) =>
  <GL.Node
    shader={shaders.hueRotate}
    width={width}
    height={height}
    uniforms={{ hue, tex }}
  />,
  { displayName: "HueRotate"});
