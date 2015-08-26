const React = require("react");
const GL = require("gl-react");
const Blur1D = require("./Blur1D");

class Blur extends GL.Component {
  render () {
    const { width, height, children, minBlur, maxBlur, blurMap, offset } = this.props;
    const sharedProps = { width, height, minBlur, maxBlur, blurMap, offset };
    return (
      <Blur1D {...sharedProps} direction={[ 1, 0 ]}>
        <Blur1D {...sharedProps} direction={[ 0, 1 ]}>
          <Blur1D {...sharedProps} direction={[ -1/Math.sqrt(2), 1/Math.sqrt(2) ]}>
            <Blur1D {...sharedProps} direction={[ 1/Math.sqrt(2), 1/Math.sqrt(2) ]}>
              {children}
            </Blur1D>
          </Blur1D>
        </Blur1D>
      </Blur1D>
    );
  }
}

module.exports = Blur;
