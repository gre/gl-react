import React, { useRef, useMemo, useCallback } from "react";
import { Shaders, Node, GLSL, Bus, Uniform } from "gl-react";
import { Surface } from "gl-react-dom";
import { useTimeLoop } from "../hooks/useTimeLoop";

const shaders = Shaders.create({
  blur1d: {
    frag: GLSL`
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
    `,
  },
  game: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D G, R, B, L, E;
uniform float s, F;
uniform vec2 k;
uniform float S;
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
    `,
  },
  glare: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = vec4(step(0.9, texture2D(t, uv).r));
}
    `,
  },
  laser: {
    frag: GLSL`
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
    `,
  },
  persistence: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform sampler2D r;
void main() {
  vec3 b = texture2D(r, uv).rgb;
  gl_FragColor = vec4(
    b * (0.82 - 0.3 * b.r * b.r) +
    texture2D(t, uv).rgb,
    1.0);
}
`,
  },
  player: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float pt;
uniform float pl;
uniform float S;
uniform float ex;
uniform float J;
uniform float P;
float disc (vec2 c, vec2 r) {
  return step(length((uv - c) / r), 1.0);
}
float squircle (vec2 c, vec2 r, float p) {
  vec2 v = (uv - c) / r;
  return step(pow(abs(v.x), p) + pow(abs(v.y), p), 1.0);
}
vec3 env () {
  return 0.1 +
  0.3 * vec3(1.0, 0.9, 0.7) *
    smoothstep(0.4, 0.1, distance(uv, vec2(0.2, 1.2))) +
  0.4 * vec3(0.8, 0.6, 1.0) *
    smoothstep(0.5, 0.2, distance(uv, vec2(1.3, 0.7)));
}
vec4 player (float p, float dx) {
  vec4 c = vec4(0.0);
  vec2 e = vec2(
    min(ex, 1.0),
    mix(min(ex, 1.0), min(ex-1.0, 1.0), 0.5));
  vec4 skin = 0.2 + 0.4 * pow(abs(cos(4.*p+S)), 2.0) *
    vec4(1.0, 0.7, 0.3, 1.0);
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
  J * vec2(0.0, 0.2) +
  walk * vec2(
    0.03 * cos(4.0*pt + sin(pt)),
    0.05 * abs(sin(3.0*pt))) +
  e * play * (1.0 - P) * vec2(
    0.05 * cos(pt * (1.0 + 0.1 * sin(pt))),
    0.05 * abs(sin(pt)));
  vec2 pos2 = mix(pos, vec2(0.5), 0.5);
  pos.x += dx;
  pos2.x += dx;
  c += skin * disc(pos, vec2(0.06, 0.1));
  c *= 1.0 - (0.5 + 0.5 * feminity) *
    disc(pos - vec2(0.0, 0.04), vec2(0.03, 0.01));
  c *= 1.0 - disc(pos + vec2(0.03, 0.03), vec2(0.02, 0.01));
  c *= 1.0 - disc(pos + vec2(-0.03, 0.03), vec2(0.02, 0.01));
  c *= 1.0 - 0.6 * disc(pos, vec2(0.01, 0.02));
  c += hair * disc(pos + vec2(0.0, hairSize), vec2(0.07, 0.1 + hairSize));
  c += play * (hair + skin) * disc(pos2 - vec2(
    -0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.y * step(0.0, pt) * P * pow(abs(sin(8.0 * pt *
      (1.0 + 0.2 * cos(pt)))), 4.0)
  ), vec2(0.055, 0.05));
  c += play * (hair + skin) * disc(pos2 - vec2(
    0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.x * step(2.0, pt) * P * pow(abs(cos(7.0 * pt)), 4.0)
  ), vec2(0.055, 0.05));
  c += step(c.a, 0.0) * (hair + skin) *
    squircle(pos - vec2(0.0, 0.10 + 0.02 * feminity),
      vec2(0.05 - 0.01 * feminity, 0.03), 4.0);
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
  c += (1.0 - smoothstep(-0.0, -5.0, pt)) *
    player(pl+step(pt, 0.0), -0.6 * smoothstep(-1., -5., pt));
  c += step (1.0, pl) *
    player(pl+step(pt, 0.0)-1.0, 2.0 *smoothstep(-4., -1., pt));
  c *= 1.0 - 1.3 * distance(uv, vec2(0.5));
  gl_FragColor = vec4(light * mix(env(), c.rgb, clamp(c.a, 0.0, 1.0)), 1.0);
}
`,
  },
  demoScene: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float time;
void main() {
  float t = time;
  vec3 c = vec3(0.0);
  float beam1 = smoothstep(0.01, 0.0, abs(uv.y - 0.5 - 0.3*sin(t*2.0+uv.x*10.0)));
  float beam2 = smoothstep(0.01, 0.0, abs(uv.y - 0.5 + 0.2*cos(t*3.0+uv.x*8.0)));
  c += vec3(0.0, 0.5, 1.0) * beam1;
  c += vec3(1.0, 0.3, 0.0) * beam2;
  float star = step(0.99, fract(sin(dot(floor(uv*40.0), vec2(12.9898,78.233)))*43758.5453));
  c += vec3(star) * 0.5;
  gl_FragColor = vec4(c, 1.0);
}`,
  },
});

const Blur1D = ({
  dim,
  dir,
  children: t,
}: {
  dim: [number, number];
  dir: [number, number];
  children: any;
}) => <Node shader={shaders.blur1d} uniforms={{ dim, dir, t }} />;

export default function BehindAsteroids() {
  const { time } = useTimeLoop();
  const laserRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const glareRef = useRef<any>(null);
  const glareCursorRef = useRef<any>(null);
  const glareBlurredRef = useRef<any>(null);
  const persistenceRef = useRef<any>(null);
  const demoRef = useRef<any>(null);

  const W = 400;
  const H = 400;
  const dim: [number, number] = [W, H];

  const t = time / 1000;
  const pt = t;
  const pl = 0;
  const ex = 0.5 + 0.5 * Math.sin(t);
  const J = 0;
  const P = 0.5;
  const s = 0.5 + 0.5 * Math.sin(t * 0.5);
  const F = 0.1 * Math.sin(t * 2);
  const k: [number, number] = [0, 0];
  const S = t * 0.3;

  return (
    <div style={{ background: "black" }}>
      <Surface width={W} height={H} pixelRatio={1}>
        <Bus ref={demoRef}>
          <Node shader={shaders.demoScene} uniforms={{ time: t }} />
        </Bus>

        <Bus ref={laserRef}>
          <Node
            shader={shaders.laser}
            uniforms={{ t: () => demoRef.current }}
          />
        </Bus>

        <Bus ref={playerRef}>
          <Blur1D dim={dim} dir={[0, 2]}>
            <Blur1D dim={dim} dir={[6, 0]}>
              <Blur1D dim={dim} dir={[2, 2]}>
                <Blur1D dim={dim} dir={[-2, 2]}>
                  <Node
                    shader={shaders.player}
                    uniforms={{ pt, pl, ex, J, P, S }}
                  />
                </Blur1D>
              </Blur1D>
            </Blur1D>
          </Blur1D>
        </Bus>

        <Bus ref={glareRef}>
          <Blur1D dim={dim} dir={[2, -4]}>
            <Node
              shader={shaders.glare}
              uniforms={{ t: () => laserRef.current }}
            />
          </Blur1D>
        </Bus>

        <Bus ref={glareCursorRef}>
          <Blur1D dim={dim} dir={[4, -8]}>
            {() => glareRef.current}
          </Blur1D>
        </Bus>

        <Bus ref={glareBlurredRef}>
          <Blur1D dim={dim} dir={[0, 1]}>
            <Blur1D dim={dim} dir={[1, 0]}>
              <Blur1D dim={dim} dir={[-0.5, 0.5]}>
                <Blur1D dim={dim} dir={[0.5, 0.5]}>
                  {() => laserRef.current}
                </Blur1D>
              </Blur1D>
            </Blur1D>
          </Blur1D>
        </Bus>

        <Bus ref={persistenceRef}>
          <Node
            shader={shaders.persistence}
            backbuffering
            uniforms={{
              t: () => glareBlurredRef.current,
              r: Uniform.Backbuffer,
            }}
          />
        </Bus>

        <Node
          shader={shaders.game}
          uniforms={{
            G: () => laserRef.current,
            R: () => persistenceRef.current,
            B: () => glareBlurredRef.current,
            L: () => glareCursorRef.current,
            E: () => playerRef.current,
            s,
            F,
            k,
            S,
          }}
        />
      </Surface>
    </div>
  );
}
