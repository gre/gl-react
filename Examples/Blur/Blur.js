const React = require("react");
const GL = require("gl-react");
const Blur1D = require("./Blur1D");

class Blur extends GL.Component {
  render () {
    const { width, height, factor, children } = this.props;
    return <Blur1D width={width} height={height} direction={[ factor, 0 ]}>
      <Blur1D width={width} height={height} direction={[ 0, factor ]}>
        {children}
      </Blur1D>
    </Blur1D>;
  }
}

module.exports = Blur;
