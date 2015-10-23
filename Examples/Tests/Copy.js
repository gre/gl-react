const React = require("react");
const GL = require("gl-react-core");

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

module.exports = GL.createComponent(
  ({ width, height, children: t, last, ...rest }) =>
  <GL.Node
    {...rest}
    shader={shaders.Copy}
    width={width}
    height={height}
    uniforms={{ t, preventAlphaMult: !last }}
  />,
  { displayName: "Copy" }
);
