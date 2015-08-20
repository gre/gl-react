const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  oneFingerResponse: {
    frag: `
precision mediump float;
varying vec2 uv;

uniform float pressed;
uniform vec2 position;

void main () {
  float dist = pow(1.0 - distance(position, uv), 4.0);
  float edgeDistX = pow(1.0 - distance(position.x, uv.x), 24.0);
  float edgeDistY = pow(1.0 - distance(position.y, uv.y), 24.0);
  gl_FragColor = vec4(pressed * vec3(0.8 * dist + edgeDistX, 0.7 * dist + edgeDistY, 0.6 * dist), 1.0);
}
    `
  }
});

class OneFingerResponse extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      pressed: 0,
      position: [ 0, 0 ]
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }
  onMouseDown (evt) {
    this.setState({
      pressed: 1
    });
    this.onMouseMove(evt);
  }
  onMouseMove (evt) {
    const { width, height } = this.props;
    const { clientX, clientY } = evt;
    const { left, top } = React.findDOMNode(this.refs.view).getBoundingClientRect();
    const [x, y] = [
      clientX - left,
      clientY - top
    ];
    this.setState({ position: [x/width, 1-y/height] });
  }
  onMouseUp () {
    this.setState({
      pressed: 0
    });
  }
  render () {
    const { width, height } = this.props;
    const { pressed, position } = this.state;
    return <GL.View
      ref="view"
      onMouseDown={this.onMouseDown}
      onMouseMove={this.onMouseMove}
      onMouseUp={this.onMouseUp}
      width={width}
      height={height}
      shader={shaders.oneFingerResponse}
      uniforms={{ pressed, position }}
    />;
  }
}

module.exports = OneFingerResponse;
