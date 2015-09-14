precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 resolution;
uniform vec2 direction;

#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')

void main () {
  gl_FragColor = blur(t, uv, resolution, direction);
}
