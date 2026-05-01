import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { useTimeLoop } from "../shared/useTimeLoop";

// CRT effect adapted from http://bit.ly/2eR1iKi. Composed on top of a small
// desert-passage render to showcase shader composition.
const desertShaders = Shaders.create({
  desertPassage: {
    frag: GLSL`
precision mediump float;
varying vec2 uv;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
#define FAR 80.
mat2 rot2( float th ){ vec2 a = sin(vec2(1.5707963, 0) + th); return mat2(a, -a.y, a.x); }
float hash( float n ){ return fract(cos(n)*45758.5453); }
float drawObject(in vec3 p){ p = fract(p)-.5; return dot(p, p); }
float cellTile(in vec3 p){
    vec4 d;
    d.x = drawObject(p - vec3(.81, .62, .53));
    p.xy = vec2(p.y-p.x, p.y + p.x)*.7071;
    d.y = drawObject(p - vec3(.39, .2, .11));
    p.yz = vec2(p.z-p.y, p.z + p.y)*.7071;
    d.z = drawObject(p - vec3(.62, .24, .06));
    p.xz = vec2(p.z-p.x, p.z + p.x)*.7071;
    d.w = drawObject(p - vec3(.2, .82, .64));
    d.xy = min(d.xz, d.yw);
    return min(d.x, d.y)*2.66;
}
vec2 path(in float z){ return vec2(20.*sin(z * .04), 4.*cos(z * .09) + 3.*(sin(z*.025)  - 1.)); }
float surfFunc(in vec3 p){
    float c = cellTile(p/6.);
    return mix(c, cos(c*6.283*2.)*.5 + .5, .125);
}
float smin(float a, float b , float s){
    float h = clamp( 0.5 + 0.5*(b-a)/s, 0. , 1.);
    return mix(b, a, h) - h*(1.0-h)*s;
}
float smax(float a, float b, float s){
    float h = clamp( 0.5 + 0.5*(a-b)/s, 0., 1.);
    return mix(b, a, h) + h*(1.0-h)*s;
}
float map(vec3 p){
    float sf = surfFunc(p);
    float cav = dot(cos(p*3.14159265/8.), sin(p.yzx*3.14159265/8.)) + 2.;
    p.xy -= path(p.z);
    float tun = 1.5 - length(p.xy*vec2(1, .4));
    tun = smax(tun, 1.-cav, 2.) + .75 + (.5-sf);
    float gr = p.y + 7. - cav*.5 + (.5-sf)*.5;
    float rf = p.y - 15.;
    return smax(smin(tun, gr, .1), rf, 1.);
}
float trace(in vec3 ro, in vec3 rd){
    float t = 0., h;
    for(int i=0; i<64; i++){
        h = map(ro+rd*t);
        if(abs(h)<0.002*(t*.25 + 1.) || t>FAR) break;
        t += h*.8;
    }
    return min(t, FAR);
}
vec3 normal(in vec3 p) {
    vec2 e = vec2(-1., 1.)*0.001;
    return normalize(e.yxx*map(p + e.yxx) + e.xxy*map(p + e.xxy) + e.xyx*map(p + e.xyx) + e.yyy*map(p + e.yyy));
}
vec3 tex3D( sampler2D t, in vec3 p, in vec3 n ){
    n = max(abs(n) - .2, .001); n /= (n.x + n.y + n.z );
    p = (texture2D(t, p.yz)*n.x + texture2D(t, p.zx)*n.y + texture2D(t, p.xy)*n.z).xyz;
    return p*p;
}
vec3 getSky(){ return vec3(2., 1.4, .7); }
void main() {
    vec2 u = uv * 2.0 - 1.0;
    vec3 ro = vec3(0, 0, iGlobalTime*8.);
    vec3 lookAt = ro + vec3(0, 0, .5);
    ro.xy += path(ro.z);
    lookAt.xy += path(lookAt.z);
    float FOV = 3.14159265/2.5;
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(vec3(forward.z, 0, -forward.x ));
    vec3 up = cross(forward, right);
    vec3 rd = normalize(forward + FOV*u.x*right + FOV*u.y*up);
    float t = trace(ro, rd);
    vec3 col = getSky();
    if (t < FAR) {
      vec3 sp = ro+t*rd;
      vec3 sn = normal(sp);
      const float tSize = 1./4.;
      vec3 base = clamp(mix(vec3(1.152, 0.4275,.153), vec3(.225, 0.05985, 0.0153), -sn.y*.5 + 1.75), vec3(.9, 0.534375, 0.239), vec3(.9, .855, .765));
      col = smoothstep(-.5, 1., tex3D(iChannel0, sp*tSize, sn)*2.) * base;
    }
    col = mix(col, getSky(), min(t*t*1.5/FAR/FAR, 1.));
    u = uv;
    col = min(col, 1.)*pow( 16.0*u.x*u.y*(1.0-u.x)*(1.0-u.y) , .125);
    gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1);
}`,
  },
});

const crtShaders = Shaders.create({
  crt: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D rubyTexture;
uniform vec2 rubyInputSize;
uniform vec2 rubyOutputSize;
uniform vec2 rubyTextureSize;
uniform float distortion;
#define TEX2D(c) pow(texture2D(rubyTexture, (c)), vec4(inputGamma))
#define FIX(c)   max(abs(c), 1e-6);
#define PI 3.141592653589
#define inputGamma 2.2
#define outputGamma 2.5
vec2 radialDistortion(vec2 coord) {
        coord *= rubyTextureSize / rubyInputSize;
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc) * distortion;
        return (coord + cc * (1.0 + dist) * dist) * rubyInputSize / rubyTextureSize;
}
vec4 scanlineWeights(float distance, vec4 color)
{
        vec4 wid = 2.0 + 2.0 * pow(color, vec4(4.0));
        vec4 weights = vec4(distance * 3.333333);
        return 0.51 * exp(-pow(weights * sqrt(2.0 / wid), wid)) / (0.18 + 0.06 * wid);
}
void main()
{
        vec2 one = 1.0 / rubyTextureSize;
        vec2 xy = radialDistortion(uv.xy);
        vec2 uv_ratio = fract(xy * rubyTextureSize) - vec2(0.5);
        xy = (floor(xy * rubyTextureSize) + vec2(0.5)) / rubyTextureSize;
        vec4 coeffs = PI * vec4(1.0 + uv_ratio.x, uv_ratio.x, 1.0 - uv_ratio.x, 2.0 - uv_ratio.x);
        coeffs = FIX(coeffs);
        coeffs = 2.0 * sin(coeffs) * sin(coeffs / 2.0) / (coeffs * coeffs);
        coeffs /= dot(coeffs, vec4(1.0));
        vec4 col  = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, 0.0))   + coeffs.y * TEX2D(xy)                    + coeffs.z * TEX2D(xy + vec2(one.x, 0.0)) + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, 0.0)),   0.0, 1.0);
        vec4 col2 = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, one.y)) + coeffs.y * TEX2D(xy + vec2(0.0, one.y)) + coeffs.z * TEX2D(xy + one)              + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, one.y)), 0.0, 1.0);
        vec4 weights  = scanlineWeights(abs(uv_ratio.y) , col);
        vec4 weights2 = scanlineWeights(1.0 - uv_ratio.y, col2);
        vec3 mul_res  = (col * weights + col2 * weights2).xyz;
        float mod_factor = uv.x * rubyOutputSize.x * rubyTextureSize.x / rubyInputSize.x;
        vec3 dotMaskWeights = mix(
                vec3(1.05, 0.75, 1.05),
                vec3(0.75, 1.05, 0.75),
                floor(mod(mod_factor, 2.0))
            );
        mul_res *= dotMaskWeights;
        mul_res = pow(mul_res, vec3(1.0 / (2.0 * inputGamma - outputGamma)));
        gl_FragColor = vec4(mul_res, 1.0);
}`,
  },
});

const W = 320;
const H = 320;
const TEX = 128;

export default function DemoDesertCRT({
  distortion = 0.2,
}: {
  distortion?: number;
}) {
  const { time } = useTimeLoop(30);
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <Node
          shader={crtShaders.crt}
          uniforms={{
            rubyTexture: (
              <Node
                shader={desertShaders.desertPassage}
                width={TEX}
                height={TEX}
                uniforms={{
                  iGlobalTime: time / 1000,
                  iChannel0: { uri: "https://i.imgur.com/wxqlQkh.jpg" },
                }}
              />
            ),
            rubyInputSize: [TEX, TEX],
            rubyOutputSize: [W, H],
            rubyTextureSize: [TEX, TEX],
            distortion,
          }}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: W, height: H },
});
