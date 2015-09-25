const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  TransparentNonPremultiplied: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main () {
  gl_FragColor = vec4(texture2D(t, uv).rgb, 0.0);
}
`
  }
});

class TransparentNonPremultiplied extends GL.Component {
  render () {
    const { children: t, ...rest } = this.props;
    return <GL.View
      {...rest}
      opaque={false}
      shader={shaders.TransparentNonPremultiplied}
      uniforms={{ t }}
    />;
  }
}

module.exports = TransparentNonPremultiplied;
