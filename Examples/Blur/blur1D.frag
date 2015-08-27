precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 resolution;
uniform vec2 direction;
uniform float minBlur;
uniform float maxBlur;
uniform sampler2D blurMap;
uniform vec2 offset;

#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')

void main () {
  vec2 dir = direction * mix(minBlur, maxBlur, texture2D(blurMap, uv + offset).r);
  gl_FragColor = blur(t, uv, resolution, dir);
}
