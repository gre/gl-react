precision highp float;

varying vec2 uv;
uniform sampler2D t;
uniform sampler2D map;
uniform float factor;
uniform vec3 color;

void main () {
  vec4 c = texture2D(t, uv);
  float m = (1.0 - texture2D(map, uv).r) * factor;
  gl_FragColor = vec4(mix(c.rgb, color, m), c.a);
}
