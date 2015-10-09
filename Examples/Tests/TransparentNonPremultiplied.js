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

module.exports = GL.createComponent(
  ({ children: t, ...rest }) =>
  <GL.View
    {...rest}
    opaque={false}
    shader={shaders.TransparentNonPremultiplied}
    uniforms={{ t }}
  />,
{ displayName: "TransparentNonPremultiplied" });
