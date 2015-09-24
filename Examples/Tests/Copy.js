const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  Copy: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main () {
  gl_FragColor = texture2D(t, uv);
}
`
  }
});

class Copy extends GL.Component {
  render () {
    const { width, height, children: t, ...rest } = this.props;
    return <GL.View
      {...rest}
      shader={shaders.Copy}
      width={width}
      height={height}
      uniforms={{ t }}
    />;
  }
}

module.exports = Copy;
