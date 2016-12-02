precision highp float;

varying vec2 uv;

uniform float pt; // playing since time
uniform float pl; // player number
uniform float S; // Seed
uniform float ex; // excitement
uniform float J; // jump
uniform float P; // playing

float disc (vec2 c, vec2 r) {
  return step(length((uv - c) / r), 1.0);
}
float squircle (vec2 c, vec2 r, float p) {
  vec2 v = (uv - c) / r;
  return step(pow(abs(v.x), p) + pow(abs(v.y), p), 1.0);
}

vec3 env () {
  return 0.1 +
  0.3 * vec3(1.0, 0.9, 0.7) * smoothstep(0.4, 0.1, distance(uv, vec2(0.2, 1.2))) +
  0.4 * vec3(0.8, 0.6, 1.0) * smoothstep(0.5, 0.2, distance(uv, vec2(1.3, 0.7)));
}

vec4 player (float p, float dx) {
  vec4 c = vec4(0.0);

  vec2 e = vec2(
    min(ex, 1.0),
    mix(min(ex, 1.0), min(ex-1.0, 1.0), 0.5));

  // variable params
  vec4 skin = 0.2 + 0.4 * pow(abs(cos(4.*p+S)), 2.0) * vec4(1.0, 0.7, 0.3, 1.0);
  vec4 hair = vec4(0.5, 0.3, 0.3, 1.0);
  vec4 sweater = vec4(
    0.3 * (1.0 + cos(3.*p + 6.*S)),
    0.2 * (1.0 + cos(7.*p + 7.*S)),
    0.1+0.2 * (1.0 + sin(7.*p + 8.*S)),
    1.0);
  float feminity = step(sin(9.0*p+S), 0.0);
  float hairSize = 0.02 + 0.02 * feminity * cos(p+S);
  float walk = step(dx, -0.01) + step(0.01, dx);
  float play = (1.0 - walk) * step(0.0, pt);
  vec2 pos = vec2(0.5) +
  // jumping cycle
  J * vec2(0.0, 0.2) +
  // walking cycle
  walk * vec2(
    0.03 * cos(4.0*pt + sin(pt)),
    0.05 * abs(sin(3.0*pt))) +
  // playing cycle
  e * play * (1.0 - P) * vec2(
    0.05 * cos(pt * (1.0 + 0.1 * sin(pt))),
    0.05 * abs(sin(pt)));
  vec2 pos2 = mix(pos, vec2(0.5), 0.5);
  pos.x += dx;
  pos2.x += dx;

  // face skin
  c += skin * disc(pos, vec2(0.06, 0.1));
  // mouth
  c *= 1.0 - (0.5 + 0.5 * feminity) * disc(pos - vec2(0.0, 0.04), vec2(0.03, 0.01));
  // left eye
  c *= 1.0 - disc(pos + vec2(0.03, 0.03), vec2(0.02, 0.01));
  // right eye
  c *= 1.0 - disc(pos + vec2(-0.03, 0.03), vec2(0.02, 0.01));
  // nose
  c *= 1.0 - 0.6 * disc(pos, vec2(0.01, 0.02));
  // hair (also contrib to face skin color)
  c += hair * disc(pos + vec2(0.0, hairSize), vec2(0.07, 0.1 + hairSize));
  // left hand
  c += play * (hair + skin) * disc(pos2 - vec2(
    -0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.y * step(0.0, pt) * P * pow(abs(sin(8.0 * pt * (1.0 + 0.2 * cos(pt)))), 4.0)
  ), vec2(0.055, 0.05));
  // right hand
  c += play * (hair + skin) * disc(pos2 - vec2(
    0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.x * step(2.0, pt) * P * pow(abs(cos(7.0 * pt)), 4.0)
  ), vec2(0.055, 0.05));
  // neck
  c += step(c.a, 0.0) * (hair + skin) *
    squircle(pos - vec2(0.0, 0.10 + 0.02 * feminity),
      vec2(0.05 - 0.01 * feminity, 0.03), 4.0);
  // sweater
  vec2 sr = vec2(
    0.16 + 0.04 * sin(9.*p),
    0.27 + 0.02 * cos(9.*p));
  c += step(c.r+c.g+c.b, 0.0) * sweater * step(1.0,
  squircle(pos - vec2(0.0, 0.35), sr * (1.0 - 0.1 * feminity), 4.0) +
  disc(pos - vec2(0.0, 0.35), sr));
  return c;
}

void main() {
  float light = 0.6 + 0.4 * smoothstep(2.0, 0.0, distance(pt, -2.0));
  vec4 c = vec4(0.0);
  // main player
  c += (1.0 - smoothstep(-0.0, -5.0, pt)) *
    player(pl+step(pt, 0.0), -0.6 * smoothstep(-1., -5., pt));
  // prev player
  c += step (1.0, pl) *
    player(pl+step(pt, 0.0)-1.0, 2.0 *smoothstep(-4., -1., pt));
  c *= 1.0 - 1.3 * distance(uv, vec2(0.5));
  gl_FragColor = vec4(light * mix(env(), c.rgb, clamp(c.a, 0.0, 1.0)), 1.0);
}
