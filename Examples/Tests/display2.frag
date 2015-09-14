precision highp float;

varying vec2 uv;
uniform sampler2D t1;
uniform sampler2D t2;
uniform bool vertical;

void main () {
  float v = vertical ? 1.0 : 0.0;
  vec2 p = uv * mix(vec2(2.0, 1.0), vec2(1.0, 2.0), v);
  vec4 c1 = step(mix(p.x, p.y, v), 1.0) * texture2D(t1, p);
  vec4 c2 = step(1.0, mix(p.x, p.y, v)) * texture2D(t2, p - vec2(1.0-v, v));
  gl_FragColor = c1 + c2;
}
