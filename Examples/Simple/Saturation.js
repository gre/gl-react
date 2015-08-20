const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  saturation: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform float factor;

void main () {
  vec4 c = texture2D(image, uv);
  // Algorithm from Chapter 16 of OpenGL Shading Language
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  gl_FragColor = vec4(mix(vec3(dot(c.rgb, W)), c.rgb, factor), c.a);
}
    `
  }
});

class Saturation extends React.Component {
  render () {
    const { width, height, factor, image } = this.props;
    return <GL.View
      shader={shaders.saturation}
      width={width}
      height={height}
      uniforms={{ factor, image }}
    />;
  }
}

module.exports = Saturation;
