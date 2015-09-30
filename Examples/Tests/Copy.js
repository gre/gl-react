const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  Copy: {
    frag: `
precision highp float;

varying vec2 uv;
uniform sampler2D t;
uniform bool preventAlphaMult;

void main () {
  vec4 c = texture2D(t, uv);
  if (preventAlphaMult) // (I know if() in glsl is not performant. don't do this. It's just for readability purpose here)
    gl_FragColor = c / sqrt(c.a);
  else
    gl_FragColor = c;
}
`
  }
});

class Copy extends GL.Component {
  render () {
    const { width, height, children: t, last, ...rest } = this.props;
    return <GL.View
      {...rest}
      shader={shaders.Copy}
      width={width}
      height={height}
      uniforms={{ t, preventAlphaMult: !last }}
    />;
  }
}

module.exports = Copy;
