precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;

void main () {
  vec4 c1 = texture2D(t1, uv);
  vec4 c2 = texture2D(t2, uv);
  gl_FragColor = c1 + c2;
}
