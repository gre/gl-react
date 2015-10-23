const React = require("react");
const ReactDOM = require("react-dom");
const GL = require("gl-react-core");
const { Surface } = require("gl-react");
const { Motion, spring } = require("react-motion");

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
      const { innerWidth: width, innerHeight: height } = window;
      this.setState({ width, height });
    });
  }

  onMouseMove (e) {
    this.setState({
      mouse: { x: e.clientX, y: e.clientY }
    });
  }

  render () {
    const { width, height, mouse } = this.state;
    return <Motion defaultStyle={mouse} style={{ x: spring(mouse.x), y: spring(mouse.y) }}>{
      ({ x, y }) =>
      <Surface width={width} height={height} onMouseMove={this.onMouseMove}>
        <GL.Node shader={shaders.demo} uniforms={{ mouse: [ x/width, 1-y/height ] }} />
      </Surface>
    }</Motion>;
  }
}

ReactDOM.render(<Demo />, document.getElementById("container"));
