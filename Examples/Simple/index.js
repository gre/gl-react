const React = require("react");
const ReactDOM = require("react-dom");
const { Surface } = require("gl-react");
const Slider = require("./Slider");
const HelloGL = require("./HelloGL");
const Saturation = require("./Saturation");
const HueRotate = require("./HueRotate");
const PieProgress = require("./PieProgress");
const OneFingerResponse = require("./OneFingerResponse");
const AnimatedHelloGL = require("./AnimatedHelloGL");
const Colorify = require("./Colorify");
const Blur = require("./Blur");
const ReactCanvasContentExample = require("./ReactCanvasContentExample");
const colorScales = require("./colorScales");

class Simple extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      saturationFactor: 1,
      hue: 0,
      progress: 0.5,
      factor: 1,
      text: "leading the pack",
      colorScale: "Spectral",
      disableLinearInterpolation: false
    };
    this.onCapture1 = this.onCapture1.bind(this);
  }

  onCapture1 () {
    this.refs.helloGL.captureFrame(data64 => {
      location.href = data64;
    });
  }

  render () {

    const {
      saturationFactor,
      hue,
      text,
      progress,
      factor,
      colorScale,
      disableLinearInterpolation
    } = this.state;

    return <div style={styles.container}>
      <h1 style={styles.title}>
        gl-react Simple demos
      </h1>
      <div style={styles.demos}>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>1. Hello GL</h2>
          <Surface width={256} height={171} ref="helloGL">
            <HelloGL />
          </Surface>
          <p>
            <button onClick={this.onCapture1}>captureFrame()</button>
          </p>
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>2. Saturate an Image</h2>
          <Surface width={256} height={171}>
            <Saturation
              factor={saturationFactor}
              image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
            />
          </Surface>
          <Slider
            maximumValue={8}
            value={saturationFactor}
            onValueChange={saturationFactor => this.setState({ saturationFactor })}
          />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>3. Hue Rotate on a Canvas</h2>
          <Surface width={256} height={180} autoRedraw>
            <HueRotate hue={hue}>
              <ReactCanvasContentExample width={256} height={180} text={text} />
            </HueRotate>
          </Surface>
          <Slider
            maximumValue={2 * Math.PI}
            value={hue}
            onValueChange={hue => this.setState({ hue })}
          />
        <input
            type="text"
            onChange={e => this.setState({ text: e.target.value })}
            value={text}
          />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>4. Progress Indicator</h2>
          <Surface width={256} height={180} opaque={false}>
            <PieProgress progress={progress} width={256} height={180} />
          </Surface>
          <Slider
            value={progress}
            onValueChange={progress => this.setState({ progress })}
          />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>5. Mouse Responsive</h2>
          <OneFingerResponse
            width={256}
            height={180}
          />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>6. Animation</h2>
          <AnimatedHelloGL
            width={256}
            height={180}
          />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>7. Blur (2-pass)</h2>
          <Surface width={256} height={180}>
            <Blur width={256} height={180} factor={factor}>
              http://i.imgur.com/3On9QEu.jpg
            </Blur>
          </Surface>
          <Slider
            maximumValue={2}
            value={factor}
            onValueChange={factor => this.setState({ factor })} />
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>8. Blur (2-pass) over UI</h2>
          This example is not available because not possible to do with WebGL.
        </div>

        <div style={styles.demo}>
          <h2 style={styles.demoTitle}>9. Texture from array</h2>
          <Surface width={256} height={190} opaque={false}>
            <Colorify
              colorScale={colorScales[colorScale]}
              disableLinearInterpolation={disableLinearInterpolation}>
              http://i.imgur.com/iPKTONG.jpg
            </Colorify>
          </Surface>
          <select style={styles.select} value={colorScale} onChange={({target:{value:colorScale}}) => this.setState({ colorScale })}>
            {Object.keys(colorScales).map(cs => <option value={cs}>{cs}</option>)}
          </select>
          <label>
            <input type="checkbox" onChange={({target:{checked:disableLinearInterpolation}}) => this.setState({ disableLinearInterpolation })} />
            Disable Linear Interpolation
          </label>
        </div>

      </div>
    </div>;
  }
}

const styles = {
  container: {
    padding: "20px",
    background: "#f9f9f9 url(http://i.imgur.com/RE6MGrd.png) repeat",
    backgroundSize: "20px 20px"
  },
  title: {
    fontSize: "20px",
    textAlign: "center",
    margin: "0px",
    marginBottom: "20px",
    fontWeight: "bold"
  },
  demos: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  demo: {
    width: "256px",
    margin: "10px 20px"
  },
  demoTitle: {
    marginBottom: "16px",
    color: "#999",
    fontWeight: 300,
    fontSize: "20px"
  },
  select: {
    margin: "4px 0",
    width: "100%"
  }
};

ReactDOM.render(<Simple />, document.getElementById("container"));
