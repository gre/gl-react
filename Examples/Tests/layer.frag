precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;

void main () {
  vec4 c1 = texture2D(t1, uv);
  vec4 c2 = texture2D(t2, uv);
  gl_FragColor = vec4(mix(c1.rgb, c2.rgb, c2.a), c1.a + c2.a);
}
