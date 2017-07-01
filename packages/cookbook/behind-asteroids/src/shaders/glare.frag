precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main() {
  gl_FragColor = vec4(step(0.9, texture2D(t, uv).r));
}
