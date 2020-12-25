/**
 * This celullar automaton is extracted from a game I wrote in 2014 for JS13K:
 * https://github.com/gre/ibex
 *
 * Technical article: http://greweb.me/2014/09/ibex-cellular-automata/
 */

//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, Uniform } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import ndarray from "ndarray";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  IBEXRender: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec2 size;
uniform sampler2D state;
uniform vec3 CL[9];

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec3 colorFor (int e) {
  if(e==0) return CL[0];
  if(e==1) return CL[1];
  if(e==2) return CL[2];
  if(e==3) return CL[3];
  if(e==4) return CL[4];
  if(e==5) return CL[5];
  if(e==6) return CL[6];
  if(e==7) return CL[7];
  return CL[8];
}
int getState (vec2 pos) {
  vec2 uv = (floor(pos) + 0.5) / size;
  bool outOfBound = uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0;
  if (outOfBound) return pos.y < 0.0 ? 1 : 0;
  float cel = texture2D(state, uv).r;
  return int(floor(.5 + 9. * cel));
}
vec3 stateColorPass (int e, vec2 pos) {
  return (
    mix(1.0, rand(pos), 0.05*float(e==1) + 0.2*float(e==8)) +
    float(e==8) * (
      step(0.97, rand(pos)) * vec3(3.0, 0.0, 0.0) +
      step(rand(pos), 0.02) * vec3(1.5, -0.5, 0.5)
    )
  ) * colorFor(e);
}
void main(){
  vec2 statePos = uv * size;
  vec2 statePosFloor = floor(statePos);
  vec3 stateColor = stateColorPass(getState(statePosFloor), statePosFloor);
  vec3 c = stateColor;
  vec2 pixelPos = fract(statePos);
  vec3 pixelColor = -vec3(0.03) * (pixelPos.x - pixelPos.y);
  c += pixelColor;
  gl_FragColor = vec4(c, 1.0);
}
`,
  },
  IBEXLogic: {
    frag: GLSL`
#define RAND (S_=vec2(rand(S_), rand(S_+9.))).x
#define AnyADJ(e) (NW==e||SE==e||NE==e||SW==e||NN==e||SS==e||EE==e||WW==e)
precision highp float;
int A  = 0;
int E  = 1;
int F  = 2;
int W  = 3;
int V  = 4;
int S  = 5;
int Al = 6;
int Ar = 7;
int G  = 8;
varying vec2 uv;
uniform vec2 SZ;
uniform float SD;
uniform float TI;
uniform float TS;
uniform float ST;
uniform sampler2D state;
uniform bool RU;
uniform bool draw;
uniform ivec2 DP;
uniform float DR;
uniform int DO;
uniform float forestGrowFactor;
int get (int x_, int y_) {
  vec2 u = (SZ * uv + vec2(x_, y_)) / SZ;
  return (u.x < 0.0 || u.x >= 1.0 || u.y < 0.0 || u.y >= 1.0) ? 0 :
    int(floor(.5 + 9. * texture2D(state, u).r));
}
bool between (float f, float a, float b) {
  return a <= f && f <= b;
}
float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float grassDistrib (vec2 p) {
  return mix(
  rand(vec2(p.x)),
  0.5*(1.0+(cos(sin(p.y*0.01 + p.x * 0.05) +
  (1.0 + 0.3*sin(p.x*0.01)) * p.y * 0.08))),
  0.6
  );
}
bool hellTriggerPosition (vec2 p) {
  if (TS==0.0) return false;
  float hellTickStart = 800.0;
  float hellTickInterv = 70.0;
  float hellSize = 5.0;
  float dt = TI - TS - hellTickStart;
  float x = floor(dt / hellTickInterv);
  float y = (dt - x * hellTickInterv);
  return distance(vec2(2.0 * (hellSize * x - ST), hellSize * y), p) <= hellSize;
}
void main () {
  vec2 p = uv * SZ;
  vec2 S_ = p + 0.001 * TI;
  int NW = get(-1, 1);
  int NN = get( 0, 1);
  int NE = get( 1, 1);
  int WW = get(-1, 0);
  int CC = get( 0, 0);
  int EE = get( 1, 0);
  int SW = get(-1,-1);
  int SS = get( 0,-1);
  int SE = get( 1,-1);
  bool prevIsSolid = CC==E||CC==G||CC==V||CC==S;
  int r = A;
  int grassMaxHeight = int(20.0 * pow(grassDistrib(p), 1.3));
  float rainRelativeTime = mod(TI, 300.0);
  float volcRelativeTime = mod(TI, 25.0);
  if (
    -0.05 * float(NW==W) + -0.40 * float(NN==W) + -0.05 * float(NE==W) +
    -0.50 * float(WW==W) + -0.50 * float(CC==W) + -0.50 * float(EE==W) +
     0.35 * float(SW==F) +  0.90 * float(SS==F) +  0.35 * float(SE==F)
   >= 0.9 - 0.6 * RAND
   ||
   CC == F && RAND < 0.9 && AnyADJ(G)
  ) {
    r = F;
  }
  if (
    between(
      0.3 * float(NW==W) +  0.9 * float(NN==W) +  0.3 * float(NE==W) +
      0.1 * float(WW==W) + -0.3 * float(CC==F) +  0.1 * float(EE==W) +
                           -0.3 * float(SS==F)
      ,
      0.9 - 0.6 * RAND,
      1.4 + 0.3 * RAND
    )
    ||
    !prevIsSolid &&
    RAND < 0.98 &&
    ( (WW==W||NW==W) && SW==E || (EE==W||NE==W) && SE==E )
    ||
    !prevIsSolid &&
    p.y >= SZ.y-1.0 &&
    rainRelativeTime < 100.0 &&
    between(
      p.x -
      (rand(vec2(SD*0.7 + TI - rainRelativeTime)) * SZ.x)
      ,
      0.0,
      100.0 * rand(vec2(SD + TI - rainRelativeTime))
    )
    ||
    !prevIsSolid && (
      0.9 * float(NW==S) +  1.0 * float(NN==S) +  0.9 * float(NE==S) +
      0.7 * float(WW==S) +                        0.7 * float(EE==S)
      >= 1.0 - 0.3 * RAND
    )
  ) {
    r = W;
  }
  if (CC == E) {
    if (!(WW==A && EE==A)) r = E;
    if (
      RAND < 0.3 && (
        1.0 * float(NW==W) + 1.2 * float(NN==W) + 1.0 * float(NE==W) +
        0.5 * float(WW==W) +                      0.5 * float(EE==W) +
        0.3 * float(SW==W) + 0.2 * float(SS==W) + 0.3 * float(SE==W)
        >= 3.0 - 2.5 * RAND
      )
      ||
      RAND < 0.01 && ( WW==S || NN==S || EE==S )
    ) {
      r = S;
    }
    if (
    RAND < 0.01 + 0.02 * smoothstep(500.0, 5000.0, ST + p.x) &&
    ( int(WW==V) + int(SS==V) + int(EE==V) + int(SE==V) + int(SW==V) > 1 )
    ) {
      r = V;
    }
  }
  if (grassMaxHeight > 0) {
    if (CC == G) {
      r = G;
      if (
      CC == G &&
      RAND < 0.9 && (
        AnyADJ(F) ||
        AnyADJ(V)
      )) {
        r = F;
      }
    }
    else if (!prevIsSolid && (AnyADJ(E) || AnyADJ(G) || AnyADJ(S))) {
      if (RAND < 0.03 * forestGrowFactor &&
        get(0, -grassMaxHeight) != G && (
          SS==G && RAND < 0.07 ||
          SS==E && RAND < 0.02 ||
          AnyADJ(W) ||
          AnyADJ(S)
        )
      ) {
        r = G;
      }
    }
  }
  if ((!prevIsSolid || CC==F) && SS==V) {
    r = F;
  }
  if (CC == V) {
    r = V;
    if (
      NW==W || NN==W || NE==W || EE==W || WW==W
    ) {
      r = RAND < 0.8 ? S : E;
    }
    if (
      RAND<0.005 &&
      ( int(SW==F||SW==V) + int(SS==F||SS==V) + int(SE==F||SE==V) < 2 )
    ) {
      r = E;
    }
    if (
      int(NW==S) + int(SE==S) + int(NE==S) + int(SW==S) +
      int(NN==S) + int(SS==S) + int(EE==S) + int(WW==S)
      > 1
    ) {
      r = RAND < 0.2 ? V : (RAND < 0.8 ? S : E);
    }
  }
  if (prevIsSolid &&
    p.y <= 2.0 &&
    volcRelativeTime <= 1.0 &&
    RAND < 0.3 &&
    between(
      p.x -
      rand(vec2(SD*0.01 + TI - volcRelativeTime)) * SZ.x
      ,
      0.0,
      10.0 * rand(vec2(SD*0.07 + TI - volcRelativeTime))
    )
  ) {
    r = V;
  }
  if (CC == S) {
    r = S;
    if (
      RAND<0.06 &&
      ( int(NW==W||NW==S) + int(NN==W||NN==S) + int(NE==W||NE==S) < 1 )

      ||
      ( EE==F || WW==F || SS==F || SW==F || SE==F )
    ) {
      r = E;
    }
    if (AnyADJ(V)) {
      r = RAND < 0.15 ? V : (RAND < 0.6 ? S : E);
    }
  }
  if (r == A) {
    if (RAND < 0.00001) r = Al;
    if (RAND < 0.00001) r = Ar;
  }

  int wind = r==Al ? Al : r == Ar ? Ar : 0;
  float f =
(-0.1+0.05*(RAND-0.5)) * float(NW==Ar) + 0.12                  * float(NE==Al) +
-0.65                  * float(WW==Ar) + 0.65                  * float(EE==Al) +
-0.1                   * float(SW==Ar) + (0.2+0.05*(RAND-0.5)) * float(SE==Al) ;

  if (between(f, 0.4 * RAND, 0.95)) {
    wind = Al;
  }
  else if (between(f, -0.95, -0.4 * RAND)) {
    wind = Ar;
  }
  if (wind != 0) {
    if (r == A) {
      r = wind;
    }
    else if(r == F) {
      if (RAND < 0.4) r = wind;
    }
    else if (r == W) {
      if (RAND < 0.1) r = wind;
    }
  }
  if (draw) {
    vec2 pos = floor(p);
    if (distance(pos, vec2(DP)) <= DR) {
      if (DO == W) {
        if (prevIsSolid && CC!=G) {
          r = S;
        }
        else if (!prevIsSolid && mod(pos.x + pos.y, 2.0)==0.0) {
          r = W;
        }
      }
      else if (DO == F) {
        r = prevIsSolid ? V : F;
      }
      else {
        r = DO;
      }
    }
  }
  if (hellTriggerPosition(p)) {
    r = prevIsSolid ? V : F;
  }
  if (!RU) {
    if (r == F || r == W|| r == G) r = A;
    if (r == V || r == S) r = E;
  }
  gl_FragColor = vec4(float(r) / 9.0,  0.0, 0.0, 1.0);
}`,
  },
});

class IBEXLogic extends Component {
  state = {
    seed: Math.random(),
  };
  shouldComponentUpdate({ tick }) {
    return tick !== this.props.tick;
  }
  render() {
    const {
      size,
      tick,
      initialState,
      forestGrowFactor,
      waterFactor,
      fireFactor,
    } = this.props;
    const { seed } = this.state;
    let draw = false,
      drawPosition = [0, 0],
      drawRadius = 0,
      drawElement = 0;

    let w = Math.random() < waterFactor,
      f = Math.random() < fireFactor;
    if (w && f) {
      if (Math.random() * waterFactor - Math.random() * fireFactor > 0) {
        f = false;
      } else {
        w = false;
      }
    }
    if (w) {
      draw = true;
      drawPosition = [
        size[0] * Math.random(),
        size[1] * (0.8 + 0.2 * Math.random()),
      ];
      drawRadius = 4;
      drawElement = 3;
      console.log(drawElement, drawPosition, drawPosition);
    } else if (f) {
      draw = true;
      drawPosition = [size[0] * Math.random(), 0];
      drawRadius = 4;
      drawElement = 2;
      console.log(drawElement, drawPosition, drawPosition);
    }

    return (
      <Node
        shader={shaders.IBEXLogic}
        sync
        backbuffering
        uniformsOptions={{ state: { interpolation: "nearest" } }}
        uniforms={{
          state: tick === 0 ? initialState : Uniform.Backbuffer,
          SZ: size,
          SD: seed,
          TI: tick,
          TS: 0, // tick start
          RU: true, // logic running
          ST: true, // render started
          draw,
          DP: drawPosition, // draw position
          DR: drawRadius, // draw radius
          DO: drawElement, // the element that is being drawn
          forestGrowFactor,
        }}
      />
    );
  }
}

var colors = [
  [0.11, 0.16, 0.23], // 0: air
  [0.74, 0.66, 0.51], // 1: earth
  [0.84, 0.17, 0.08], // 2: fire
  [0.4, 0.75, 0.9], // 3: water
  [0.6, 0.0, 0.0], // 4: volcano (fire spawner)
  [0.3, 0.6, 0.7], // 5: source (water spawner)
  [0.15, 0.2, 0.27], // 6: wind left
  [0.07, 0.12, 0.19], // 7: wind right
  [0.2, 0.6, 0.2], // 8: grass (forest)
];

const IBEXRender = ({ size, children: state }) => (
  <Node
    shader={shaders.IBEXRender}
    uniformsOptions={{ state: { interpolation: "nearest" } }}
    uniforms={{
      state,
      size,
      CL: colors,
    }}
  />
);

const Game = timeLoop(
  class extends Component {
    state = {
      tick: 0,
      lastTickTime: this.props.time,
    };

    componentWillReceiveProps({ time, speed }) {
      this.setState(({ tick, lastTickTime }) => {
        const delta = 1000 / speed;
        if (time - lastTickTime > delta) {
          return {
            tick: tick + 1,
            lastTickTime: lastTickTime + delta,
          };
        }
      });
    }

    render() {
      const {
        size,
        initialState,
        forestGrowFactor,
        waterFactor,
        fireFactor,
      } = this.props;
      const { tick } = this.state;
      return (
        <IBEXRender size={size}>
          <IBEXLogic
            initialState={initialState}
            size={size}
            tick={tick}
            forestGrowFactor={forestGrowFactor}
            waterFactor={waterFactor}
            fireFactor={fireFactor}
          />
        </IBEXRender>
      );
    }
  }
);

// This should be implemented in a shader (it's a cellular automaton too)
// but it's how it was done in the game
function generate(startX: number, worldSize: [number, number]) {
  var worldPixelRawBuf = new Uint8Array(worldSize[0] * worldSize[1] * 4);
  var worldPixelBuf = new Uint8Array(worldSize[0] * worldSize[1]);
  var waterInGeneration = 0;
  var volcanoInGeneration = 0;
  var w = worldSize[0],
    h = worldSize[1];
  function step(a, b, x) {
    return Math.max(0, Math.min((x - a) / (b - a), 1));
  }
  function affectColor(buf, i, c) {
    buf[i] = ~~((256 * c) / 9);
    buf[i + 3] = 1;
  }
  function get(b, x, y) {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      return b[x + y * w];
    }
    return y > 50 ? 1 : 0;
  }
  function set(b, x, y, e) {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      b[x + y * w] = e;
    }
  }
  var K = 26;
  var x, y, i, k, e;
  for (x = startX; x < worldSize[0]; ++x) {
    for (y = 0; y < worldSize[1]; ++y) {
      e = +(
        Math.random() >
        0.22 +
          0.3 * (step(0, 20, y) + step(worldSize[1] - 20, worldSize[1] - 2, y))
      );
      set(worldPixelBuf, x, y, e);
    }
  }
  var swp = new Uint8Array(worldPixelBuf);
  var cur = worldPixelBuf;
  for (k = 0; k < K; ++k) {
    for (x = startX; x < worldSize[0]; ++x) {
      for (y = 0; y < worldSize[1]; ++y) {
        var me = get(cur, x, y);
        var sum =
          0.1 * me +
          (0.9 + 0.1 * Math.random()) * (get(cur, x - 1, y - 1) ? 1 : 0) +
          (0.9 + 0.1 * Math.random()) * (get(cur, x, y - 1) ? 1 : 0) +
          (0.9 + 0.1 * Math.random()) * (get(cur, x + 1, y - 1) ? 1 : 0) +
          (1.4 + 0.2 * Math.random()) * (get(cur, x - 1, y) ? 1 : 0) +
          (1.1 + 0.2 * Math.random()) * (get(cur, x + 1, y) ? 1 : 0) +
          (1.6 - 0.1 * Math.random()) * (get(cur, x - 1, y + 1) ? 1 : 0) +
          (1.2 - 0.2 * Math.random()) * (get(cur, x, y + 1) ? 1 : 0) +
          (1.0 - 0.1 * Math.random()) * get(cur, x + 1, y + 1 ? 1 : 0);
        let e = +(sum <= 6 + (Math.random() - 0.5) * (1 - k / K));
        if (
          e &&
          sum >= 6 - Math.random() * waterInGeneration + 4 * step(110, 0, y)
        )
          e = 5;
        if (
          e &&
          sum >= 6 - Math.random() * volcanoInGeneration + 6 * step(20, 60, y)
        )
          e = 4;
        set(swp, x, y, e);
      }
    }
    var tmp = swp;
    swp = cur;
    cur = tmp;
  }
  if (swp === cur) worldPixelBuf = swp;
  for (i = 0; i < worldPixelBuf.length; ++i) {
    affectColor(worldPixelRawBuf, 4 * i, worldPixelBuf[i]);
  }
  return ndarray(worldPixelRawBuf, [worldSize[0], worldSize[1], 4])
    .transpose(1, 0, 2)
    .step(1, -1, 1);
}

const size = [200, 200];

export default class Example extends Component {
  state = {
    initialState: generate(0, size),
  };
  render() {
    const {
      forestGrowFactor,
      fireFactor,
      waterFactor,
      speed,
      width,
    } = this.props;
    const { initialState } = this.state;
    return (
      <Surface style={{ width, height: width }}>
        <Game
          speed={speed}
          size={size}
          initialState={initialState}
          forestGrowFactor={forestGrowFactor}
          fireFactor={fireFactor}
          waterFactor={waterFactor}
        />
      </Surface>
    );
  }

  static defaultProps = {
    speed: 60,
    forestGrowFactor: 1,
    fireFactor: 0,
    waterFactor: 0,
  };
}

/**
* Game Rule Interactions.
*
* Each interaction use various probability. Some are very rare, some frequent.
/!\ here air means wind /!\ it is different of empty, the empty space is
* called "Nothing" aka N)
*
* Primary elements: Water, Fire, Earth, Air
* =======
* Water + Nothing => fall / slide
* Fire + Nothing => grow
* Air + Nothing => move (directional wind)
* Water + Air => Water is deviated (wind)
* Fire + Air => Fire decrease
* Earth + Water => rarely creates Water Source (water infiltration)
* Earth + Fire => rarely creates Volcano (fire melt ground into lava)
*
* Secondary elements: Source, Volcano
* =========
* Source + Nothing => creates Water (on bottom).
* Volcano + Nothing => creates Fire (on top)
* Volcano + Source => IF source on top of volcano: sometimes creates Ground.
* OTHERWISE: sometimes creates volcano.
* Volcano + Water => rarely creates Source.
* Earth + Volcano => rarely Volcano expand / grow up in the Earth.
* Earth + Source => rarely Source expand / infiltrate in the Earth.
* Source + Fire => Source die.
*
* Cases where nothing happens:
* Water + Fire
* Earth + Nothing
* Volcano + Fire
* Volcano + Air
* Earth + Air
* Source + Air
* Source + Water
*/
