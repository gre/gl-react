const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  pieProgress: {
    frag: `
precision mediump float;
varying vec2 uv;

uniform vec4 colorInside, colorOutside;
uniform float radius;
uniform float progress;
uniform vec2 dim;

const vec2 center = vec2(0.5);
const float PI = 3.14159;

void main () {
  vec2 norm = dim / min(dim.x, dim.y);
  vec2 p = uv * norm - (norm-1.0)/2.0;
  vec2 delta = p - center;
  float inside =
    step(length(delta), radius) *
    step((PI + atan(delta.y, -1.0 * delta.x)) / (2.0 * PI), progress);
  gl_FragColor = mix(
    colorOutside,
    colorInside,
    inside
  );
}
    `
  }
});

class PieProgress extends React.Component {
  render () {
    const {
      width,
      height,
      progress,
      colorInside,
      colorOutside,
      radius
    } = this.props;
    return <GL.View
      width={width}
      height={height}
      shader={shaders.pieProgress}
      opaque={false}
      uniforms={{
        dim: [ width, height ],
        progress,
        colorInside,
        colorOutside,
        radius
      }}
    />;
  }
}
PieProgress.defaultProps = {
  colorInside: [0, 0, 0, 0],
  colorOutside: [0, 0, 0, 0.5],
  radius: 0.4
};

module.exports = PieProgress;
