const React = require("react");
const GL = require("gl-react");
const { Spring } = require("react-motion");

const shaders = GL.Shaders.create({
  demo: {
    frag: `
precision mediump float;
varying vec2 uv;

uniform vec2 mouse;

void main () {
  float dist = pow(1.0 - distance(mouse, uv), 8.0);
  float edgeDistX = pow(1.0 - distance(mouse.x, uv.x), 32.0);
  float edgeDistY = pow(1.0 - distance(mouse.y, uv.y), 32.0);
  gl_FragColor = vec4(
    0.8 * dist + edgeDistX,
    0.7 * dist + edgeDistY,
    0.6 * dist,
    1.0) * smoothstep(1.0, 0.2, distance(mouse, uv));
}
    `
  }
});

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      mouse: { x: window.innerWidth/2, y: window.innerHeight/2 }
    };
    this.onMouseMove = this.onMouseMove.bind(this);
  }
  componentDidMount () {
    window.addEventListener("resize", () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    });
  }

  onMouseMove (e) {
    this.setState({
      mouse: { x: e.clientX, y: e.clientY }
    });
  }

  render () {
    const { width, height, mouse } = this.state;
    return <Spring defaultValue={{ val: mouse }} endValue={{ val: mouse, config: [140, 12] }}>
      { ({ val: { x, y } }) =>
      <GL.View
        onMouseMove={this.onMouseMove}
        shader={shaders.demo}
        width={width}
        height={height}
        uniforms={{
          mouse: [ x/width, 1-y/height ]
        }}
      />
      }
    </Spring>;
  }
}

React.render(<Demo />, document.body);
