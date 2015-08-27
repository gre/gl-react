const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  blur1D: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 direction;
uniform vec2 resolution;

// from https://github.com/Jam3/glsl-fast-gaussian-blur
vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main () {
  gl_FragColor = blur13(t, uv, resolution, direction);
}
    `
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
