require("gl-react-core/react");
const React = require("react");
const ReactDOM = require("react-dom");
const {Surface} = require("gl-react");
const HueRotate = require("./HueRotate");

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      time: 0
    };
  }
  componentDidMount () {
    const loop = time => {
      requestAnimationFrame(loop);
      this.setState({ time: time / 1000 });
    };
    requestAnimationFrame(loop);
  }
  render () {
    const { width, height } = this.props;
    const { time } = this.state;
    return <Surface width={width} height={height}>
      <HueRotate hue={Math.PI * Math.cos(3 * time)}>
        <video autoPlay loop>
          <source type="video/mp4" src="video.mp4" />
        </video>
      </HueRotate>
    </Surface>;
  }
}

ReactDOM.render(<Demo width={640} height={480} />, document.getElementById("container"));
