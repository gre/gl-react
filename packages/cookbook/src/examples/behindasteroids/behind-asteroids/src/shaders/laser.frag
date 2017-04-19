precision highp float;

varying vec2 uv;
uniform sampler2D t;

void main() {
  vec3 c = texture2D(t, uv).rgb;
  vec2 off = 0.003 * vec2(
    cos(47.0 * uv.y),
    sin(67.0 * uv.x)
  );
  gl_FragColor = vec4(
    c.r + c.g + c.b + texture2D(t, uv+off).b
  );
}
