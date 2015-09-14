const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  hueRotate: {
    frag: glslify(`${__dirname}/hueRotate.frag`)
  }
});

class HueRotate extends GL.Component {
  render () {
    const { width, height, hue, children: tex } = this.props;
    return <GL.View
      shader={shaders.hueRotate}
      width={width}
      height={height}
      uniforms={{ hue, tex }}
    />;
  }
}

module.exports = HueRotate;
