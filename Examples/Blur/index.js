const React = require("react");
const Blur = require("./Blur");

class Demo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      time: 0
    };
  }
  componentDidMount () {
    /*
    const loop = time => {
      requestAnimationFrame(loop);
      this.setState({ time: time / 1000 });
    };
    requestAnimationFrame(loop);
    */
  }
  render () {
    const { width, height } = this.props;
    const { time } = this.state;
    const factor = 0.5 * (1+Math.cos(3 * time));
    return <Blur width={width} height={height} factor={factor}>
      http://i.imgur.com/3On9QEu.jpg
    </Blur>;
  }
}

React.render(<Demo width={640} height={480} />, document.getElementById("container"));
