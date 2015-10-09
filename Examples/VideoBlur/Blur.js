const React = require("react");
const GL = require("gl-react");
const {
  PropTypes
} = React;
const Blur1D = require("./Blur1D");

const NORM = Math.sqrt(2)/2;

function directionForPass (p, factor, total) {
  const f = factor * p / total;
  switch (p%4) {
  case 0: return [f,0];
  case 1: return [0,f];
  case 2: return [f*NORM,f*NORM];
  case 3: return [f*NORM,-f*NORM];
  }
  return p%2 ? [f,0] : [0,f];
}

/** Usages:
 - Small blur:
 <Blur factor={0.5} passes={2} width={w} height={h}>{url}</Blur>
 - Medium blur:
 <Blur factor={2} passes={4} width={w} height={h}>{url}</Blur>
 - Powerful blur:
 <Blur factor={20} passes={6} width={w} height={h}>{url}</Blur>
 */

module.exports = GL.createComponent(
  ({ width, height, factor, children, passes, ...rest }) => {
    const rec = p => p <= 0 ? children :
    <Blur1D {...rest} width={width} height={height} direction={directionForPass(p, factor, passes)}>
      {rec(p-1)}
    </Blur1D>;
    return rec(passes);
  },
  {
    displayName: "Blur",
    defaultProps: {
      passes: 2
    },
    propTypes: {
      width: PropTypes.number,
      height: PropTypes.number,
      factor: PropTypes.number.isRequired,
      children: PropTypes.any.isRequired,
      passes: PropTypes.number
    }
  });
