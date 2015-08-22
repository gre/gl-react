const React = require("react");
const { Surface, Image, Text } = require("react-canvas");

const styles = {

  demospan1: {
    top: 0,
    left: 0,
    width: 256,
    height: 40,
    textAlign: "center",
    color: "#f16",
    fontWeight: "400",
    fontSize: 20,
    letterSpacing: 0
  },
  demospan2: {
    top: 120,
    left: 0,
    width: 256,
    height: 40,
    textAlign: "center",
    color: "#7bf",
    fontWeight: "300",
    fontSize: 20,
    letterSpacing: -1
  },
  demospan3: {
    top: 150,
    left: 0,
    width: 256,
    height: 40,
    textAlign: "center",
    color: "#7bf",
    fontWeight: "300",
    fontSize: 20,
    letterSpacing: -1
  }
};

class ReactCanvasContentExample extends React.Component {
  render () {
    // This component is waiting https://github.com/Flipboard/react-canvas/issues/108 to be fixed.
    const { width, height, text } = this.props;
    return <Surface width={width} height={height} top={0} left={0}>
      <Image
        crossOrigin={true}
        src="http://i.imgur.com/qVxHrkY.jpg"
        style={{
          width: width,
          height: width * 244/256,
          top: 0,
          left: 0
        }} />
      <Text style={styles.demospan1}>Throw me to the wolves</Text>
      <Text style={styles.demospan2}>and I will return</Text>
      <Text style={styles.demospan3}>{text}</Text>
    </Surface>;
  }
}

module.exports = ReactCanvasContentExample;
