const React = require("react");
const ReactDOM = require("react-dom");
const { Surface } = require("gl-react");
const HueRotate = require("./HueRotate");
const Blur = require("./Blur");
const Field = require("./Field");

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      blur: 0,
      blurPasses: 2,
      hue: 0
    };
  }
  render () {
    const { width, height } = this.props;
    const { blur, hue, blurPasses } = this.state;
    return <div style={{ width: width+"px" }}>
      <Surface eventsThrough visibleContent autoRedraw width={width} height={height}>
        <Blur width={width} height={height} passes={blurPasses} factor={blur}>
          <HueRotate hue={hue}>
            <video autoPlay loop>
              <source type="video/mp4" src="video.mp4" />
            </video>
          </HueRotate>
        </Blur>
      </Surface>
      <Field min={0} max={2*Math.PI} value={hue} onChange={hue => this.setState({ hue })} name="Hue" width={width} />
      <Field min={0} max={16} value={blur} onChange={blur => this.setState({ blur })} name="Blur" width={width} />
      <Field min={2} max={8} step={1} value={blurPasses} onChange={blurPasses => this.setState({ blurPasses })} name="Blur Passes" width={width} />
    </div>;
  }
}

ReactDOM.render(<Demo width={640} height={480} />, document.getElementById("container"));
