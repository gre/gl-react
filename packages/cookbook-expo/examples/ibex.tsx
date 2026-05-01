import React, { useState, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL, Uniform } from "gl-react";
import { Surface } from "gl-react-expo";
import { useTimeLoop } from "../shared/useTimeLoop";

// In the web cookbook, the initial state for IBEX is generated with a 2D
// canvas. RN has no canvas, so we replicate the same algorithm in a fragment
// shader that runs once at tick=0.
const shaders = Shaders.create({
  IBEXInit: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec2 size;
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
  vec2 p = floor(uv * size);
  // y inverted so x grows L->R, y grows top->bottom (matches canvas logic)
  vec2 cellPos = vec2(p.x, size.y - 1.0 - p.y);
  float groundLevel = floor(
    size.y * 0.45 + 15.0 * sin(cellPos.x * 0.05) +
    5.0 * cos(cellPos.x * 0.12)
  );
  float element = 0.0;
  if (cellPos.y < groundLevel) {
    element = 1.0; // E
    if (rand(cellPos) < 0.001 && cellPos.y > groundLevel - 10.0) {
      element = 5.0; // S
    }
    if (rand(cellPos + vec2(7.0)) < 0.0005 && cellPos.y < 10.0) {
      element = 4.0; // V
    }
  }
  gl_FragColor = vec4(element / 9.0, 0.0, 0.0, 1.0);
}`,
  },
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
uniform sampler2D state;
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
  gl_FragColor = vec4(float(r) / 9.0,  0.0, 0.0, 1.0);
}`,
  },
});

const colors = [
  [0.11, 0.16, 0.23],
  [0.74, 0.66, 0.51],
  [0.84, 0.17, 0.08],
  [0.4, 0.75, 0.9],
  [0.6, 0.0, 0.0],
  [0.3, 0.6, 0.7],
  [0.15, 0.2, 0.27],
  [0.07, 0.12, 0.19],
  [0.2, 0.6, 0.2],
];

const worldSize: [number, number] = [200, 200];

function IBEXLogic({
  tick,
  forestGrowFactor,
}: {
  tick: number;
  forestGrowFactor: number;
}) {
  const seed = useMemo(() => Math.random(), []);
  return (
    <Node
      shader={shaders.IBEXLogic}
      sync
      backbuffering
      uniformsOptions={{ state: { interpolation: "nearest" } }}
      uniforms={{
        state:
          tick === 0 ? (
            <Node
              shader={shaders.IBEXInit}
              width={worldSize[0]}
              height={worldSize[1]}
              uniforms={{ size: worldSize }}
            />
          ) : (
            Uniform.Backbuffer
          ),
        SZ: worldSize,
        SD: seed,
        TI: tick,
        forestGrowFactor,
      }}
    />
  );
}

function IBEXRender({ children: state }: { children: any }) {
  return (
    <Node
      shader={shaders.IBEXRender}
      uniformsOptions={{ state: { interpolation: "nearest" } }}
      uniforms={{ state, size: worldSize, CL: colors }}
    />
  );
}

function IBEXGame({
  speed,
  forestGrowFactor,
}: {
  speed: number;
  forestGrowFactor: number;
}) {
  const { time } = useTimeLoop();
  const tickRef = useRef(0);
  const lastTickTimeRef = useRef(0);
  const delta = 1000 / speed;
  if (time - lastTickTimeRef.current > delta) {
    tickRef.current += 1;
    lastTickTimeRef.current = time;
  }
  return (
    <IBEXRender>
      <IBEXLogic
        tick={tickRef.current}
        forestGrowFactor={forestGrowFactor}
      />
    </IBEXRender>
  );
}

export default function IBEX({
  speed = 30,
  forestGrowFactor = 1,
}: {
  speed?: number;
  forestGrowFactor?: number;
}) {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <IBEXGame speed={speed} forestGrowFactor={forestGrowFactor} />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 320, height: 320 },
});
