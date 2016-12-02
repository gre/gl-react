precision highp float;

varying vec2 uv;
uniform sampler2D G; // game
uniform sampler2D R; // persistence
uniform sampler2D B; // blur
uniform sampler2D L; // glare
uniform sampler2D E; // env (player)
uniform float s; // starting
uniform float F; // fail factor (red effect)
uniform vec2 k;

float squircleDist (vec2 a, vec2 b) {
  float p = 10.0;
  vec2 c = a-b;
  return pow(abs(pow(abs(c.x), p)+pow(abs(c.y), p)), 1.0/p);
}

void main() {
  vec2 UV = uv + k;
  vec2 pos = (UV/0.98)-0.01;
  float d = squircleDist(UV, vec2(0.5));
  float dd = smoothstep(0.45, 0.51, d);
  pos = mix(pos, vec2(0.5), 0.2 * (0.6 - d) - 0.02 * d);

  vec3 gc = texture2D(G, pos).rgb;

  gl_FragColor =
  step(0.0, UV.x) *
  step(UV.x, 1.0) *
  step(0.0, UV.y) *
  step(UV.y, 1.0) *
  vec4((
    vec3(0.03 + 0.1 * F, 0.04, 0.05) +
    mix(vec3(0.05, 0.1, 0.15) - gc, 2.0 * gc, s) +
    s * (
      texture2D(L, pos).rgb +
      vec3(0.3 + F, 0.6, 1.0) * (
        texture2D(R, pos).rgb +
        3.0 * texture2D(B, pos).rgb
      ) +
      0.5 * texture2D(E, pos).rgb
    )
  )
  * mix(1.0, smoothstep(1.0, 0.0, dd), 0.6), 1.0);
}
