const React = require("react");

const Slider = require("./Slider");
const HelloGL = require("./HelloGL");
const Saturation = require("./Saturation");
const HueRotate = require("./HueRotate");
const PieProgress = require("./PieProgress");
const OneFingerResponse = require("./OneFingerResponse");
const AnimatedHelloGL = require("./AnimatedHelloGL");
const ReactCanvasContentExample = require("./ReactCanvasContentExample");

class Simple extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      saturationFactor: 1,
      hue: 0,
      progress: 0.2,
      text: "leading the pack"
    };
  }

  render () {

    const {
      saturationFactor,
      hue,
      text,
      progress
    } = this.state;

    return <div style={styles.container}>
      <h1 style={styles.title}>
        Welcome to GL React!
      </h1>
      <div style={styles.demos}>

        <h2 style={styles.demoTitle}>1. Hello GL</h2>
        <div style={styles.demo}>
          <HelloGL width={256} height={171} />
        </div>

        <h2 style={styles.demoTitle}>2. Saturate an Image</h2>
        <div style={styles.demo}>
          <Saturation
            width={256}
            height={171}
            factor={saturationFactor}
            image={{ uri: "http://i.imgur.com/iPKTONG.jpg" }}
          />
        <Slider
          maximumValue={8}
          onValueChange={saturationFactor => this.setState({ saturationFactor })}
        />
        </div>

        <h2 style={styles.demoTitle}>3. Hue Rotate on a Canvas</h2>
        <div style={styles.demo}>
          <HueRotate
            width={256}
            height={180}
            hue={hue}>
            <ReactCanvasContentExample width={256} height={180} text={text} />
          </HueRotate>
          <Slider
            maximumValue={2 * Math.PI}
            onValueChange={hue => this.setState({ hue })}
          />
        <input
            onChange={e => this.setState({ text: e.target.value })}
            value={text}
          />
        </div>

        <span style={styles.demoTitle}>4. Progress Indicator</span>
        <div style={styles.demo}>
          <PieProgress
            width={256}
            height={180}
            progress={progress}
          />
          <Slider
            onValueChange={progress => this.setState({ progress })}
          />
        </div>

        <span style={styles.demoTitle}>5. Mouse Responsive</span>
        <div style={styles.demo}>
          <OneFingerResponse
            width={256}
            height={180}
          />
        </div>

        <span style={styles.demoTitle}>6. Animation</span>
        <div style={styles.demo}>
          <AnimatedHelloGL
            width={256}
            height={180}
          />
        </div>

      </div>
    </div>;
  }
}

const styles = {
  container: {
    width: "400px",
    backgroundColor: "#F9F9F9"
  },
  title: {
    fontSize: "20px",
    textAlign: "center",
    margin: "5px",
    marginBottom: "20px",
    fontWeight: "bold"
  },
  demos: {
    marginLeft: "40px",
    width: "276px",
    marginBottom: "20px"
  },
  demoTitle: {
    marginBottom: "16px",
    color: "#999",
    fontWeight: 300,
    fontSize: "20px"
  },
  demo: {
    marginBottom: "20px",
    marginLeft: "20px"
  }
};

React.render(<Simple />, document.getElementById("container"));
