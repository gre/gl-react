const React = require("react");

/*
const Blur1D = require("./Blur1D");

class Blur extends React.Component {
  render () {
    const { width, height, factor, children } = this.props;
    return <Blur1D width={width} height={height} direction={[ factor, 0 ]}>
      <Blur1D width={width} height={height} direction={[ 0, factor ]}>
        {children}
      </Blur1D>
    </Blur1D>;
  }
}
*/

const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  blur1D: {
    frag: glslify(`${__dirname}/blur1D.frag`)
  }
});

class Blur extends React.Component {
  render () {
    const { width, height, factor, children } = this.props;
    return <GL.View
      shader={shaders.blur1D}
      width={width}
      height={height}
      uniforms={{
        direction: [ factor, 0 ],
        resolution: [ width, height ]
      }}>
      <GL.Target uniform="t">
        <GL.View
          shader={shaders.blur1D}
          width={width}
          height={height}
          uniforms={{
            direction: [ 0, factor ],
            resolution: [ width, height ]
          }}>
          <GL.Target uniform="t">
            {children}
          </GL.Target>
        </GL.View>
      </GL.Target>
    </GL.View>;
  }
}

module.exports = Blur;
