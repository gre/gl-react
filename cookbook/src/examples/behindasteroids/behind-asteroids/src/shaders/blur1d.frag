precision highp float;

varying vec2 uv;
uniform sampler2D t;
uniform vec2 dim;
uniform vec2 dir;

void main() {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * dir;
  vec2 off2 = vec2(3.2307692308) * dir;
  color += texture2D(t, uv) * 0.2270270270;
  color += texture2D(t, uv + (off1 / dim)) * 0.3162162162;
  color += texture2D(t, uv - (off1 / dim)) * 0.3162162162;
  color += texture2D(t, uv + (off2 / dim)) * 0.0702702703;
  color += texture2D(t, uv - (off2 / dim)) * 0.0702702703;
  gl_FragColor = color;
}
