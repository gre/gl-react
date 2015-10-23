const React = require("react");
const GL = require("gl-react-core");

const shaders = GL.Shaders.create({
  colorify: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform sampler2D colorScale; // used as a lookup texture
uniform float legend;

float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}

void main () {
  vec4 imgC = texture2D(image, uv / vec2(1.0, 1.0 - legend) - vec2(0.0, legend));
  vec4 scaleC = texture2D(colorScale, vec2(monochrome(imgC.rgb), 0.5));
  float legendArea = step(uv.y, legend);
  gl_FragColor = step(uv.y, legend - 0.02) * texture2D(colorScale, uv) +
    step(legend, uv.y) * vec4(scaleC.rgb, imgC.a * scaleC.a);
}
    `
  }
});

module.exports = GL.createComponent(
  ({ width, height, children: image, colorScale, legend, disableLinearInterpolation }) =>
    <GL.Node
      shader={shaders.colorify}
      width={width}
      height={height}
      uniforms={{ image, legend }}
    >
      <GL.Uniform name="colorScale" disableLinearInterpolation={disableLinearInterpolation}>
        {colorScale}
      </GL.Uniform>
    </GL.Node>
  , {
    displayName: "Colorify",
    defaultProps: {
      legend: 0.06
    }
  }
);
