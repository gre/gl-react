const React = require("react");
const GL = require("gl-react");

class Transition extends React.Component {
  render () {
    const { width, height, shader, progress, from, to, uniforms } = this.props;
    const scale = window.devicePixelRatio;
    return <GL.View
      shader={shader}
      width={width}
      height={height}
      opaque={false}
      uniforms={{
        progress,
        from,
        to,
        ...uniforms,
        resolution: [ width * scale, height * scale ]
      }}
    />;
  }
}

module.exports = Transition;
