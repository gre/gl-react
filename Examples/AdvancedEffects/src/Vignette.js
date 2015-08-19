const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  imageVignette: {
    frag: `
precision highp float;
varying vec2 uv;

uniform float time;
uniform float amp;
uniform float freq;
uniform sampler2D texture;
uniform float moving;

uniform vec2 finger;

vec2 lookup (vec2 offset, float amp2) {
  return mod(
    uv + amp2 * amp * vec2(cos(freq*(uv.x+offset.x)+time),sin(freq*(uv.y+offset.x)+time)) + vec2(moving * time/10.0, 0.0),
    vec2(1.0));
}

void main() {
  float dist = distance(uv, finger);
  float amp2 = pow(1.0 - dist, 2.0);
  float colorSeparation = 0.02 * mix(amp2, 1.0, 0.5);
  vec2 orientation = vec2(1.0, 0.0);
  gl_FragColor = vec4(
    vec3(
    texture2D(texture, lookup(colorSeparation * orientation, amp2)).r,
    texture2D(texture, lookup(-colorSeparation * orientation, amp2)).g,
    texture2D(texture, lookup(vec2(0.0), amp2)).b),
    1.0-min(0.95, pow(1.8 * distance(uv, finger), 4.0) + 0.5 * pow(distance(fract(50.0 * uv.y), 0.5), 2.0)));
}
`
  }
});


class Vignette extends React.Component {
  constructor (props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.state = {
      finger: [0.5, 0.5]
    };
  }
  onMouseMove (evt) {
    const { width, height } = this.props;
    const { clientX, clientY } = evt;
    const { left, top } = React.findDOMNode(this.refs.view).getBoundingClientRect();
    const [x, y] = [
      clientX - left,
      clientY - top
    ];
    this.setState({ finger: [x/width, 1-y/height] });
  }

  render () {
    const { width, height, time, source } = this.props;
    const { finger } = this.state;
    return <GL.View
      ref="view"
      onMouseMove={this.onMouseMove}
      shader={shaders.imageVignette}
      width={width}
      height={height}
      opaque={false}
      uniforms={{
        time: time,
        freq: 10 + 2 * Math.sin(0.7*time),
        texture: source,
        amp: 0.05 + Math.max(0, 0.03*Math.cos(time)),
        moving: 0,
        finger: finger
      }}
    />;
  }
}

module.exports = Vignette;
