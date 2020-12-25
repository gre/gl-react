//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import timeLoop from "../../HOC/timeLoop";
import shadertoyTex17jpg from "../../images/shadertoy-tex17.jpg";

const shaders = Shaders.create({
  desertPassage: {
    // from https://www.shadertoy.com/view/XtyGzc
    frag: GLSL`
precision mediump float;
varying vec2 uv;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
#define FAR 80.
mat2 rot2( float th ){ vec2 a = sin(vec2(1.5707963, 0) + th); return mat2(a, -a.y, a.x); }
float hash( float n ){ return fract(cos(n)*45758.5453); }
float hash( vec3 p ){ return fract(sin(dot(p, vec3(7, 157, 113)))*45758.5453); }
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
    for(int i=0; i<128; i++){
        h = map(ro+rd*t);
        if(abs(h)<0.002*(t*.25 + 1.) || t>FAR) break;
        t += h*.8;
    }
    return min(t, FAR);
}
vec3 normal(in vec3 p)
{
    vec2 e = vec2(-1., 1.)*0.001;
	return normalize(e.yxx*map(p + e.yxx) + e.xxy*map(p + e.xxy) +
					 e.xyx*map(p + e.xyx) + e.yyy*map(p + e.yyy) );
}
vec3 tex3D( sampler2D t, in vec3 p, in vec3 n ){
    n = max(abs(n) - .2, .001);
    n /= (n.x + n.y + n.z );
	p = (texture2D(t, p.yz)*n.x + texture2D(t, p.zx)*n.y + texture2D(t, p.xy)*n.z).xyz;
    return p*p;
}
vec3 doBumpMap( sampler2D tx, in vec3 p, in vec3 n, float bf){
    const vec2 e = vec2(0.001, 0);
    mat3 m = mat3( tex3D(tx, p - e.xyy, n), tex3D(tx, p - e.yxy, n), tex3D(tx, p - e.yyx, n));
    vec3 g = vec3(0.299, 0.587, 0.114)*m;
    g = (g - dot(tex3D(tx,  p , n), vec3(0.299, 0.587, 0.114)) )/e.x; g -= n*dot(n, g);
    return normalize( n + g*bf );
}
float n3D(in vec3 p){
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p); p -= ip;
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p*p*(3. - 2.*p);
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z);
}
float bumpSurf3D( in vec3 p){
    float bmp = cellTile(p/3.)*.8 + cellTile(p)*.2;
    float ns = n3D(p*6. - bmp*6.);
    return mix(bmp, 1. - abs(ns-.333)/.667, .05);
}
vec3 doBumpMap(in vec3 p, in vec3 nor, float bumpfactor){
    const vec2 e = vec2(0.001, 0);
    float ref = bumpSurf3D(p);
    vec3 grad = (vec3(bumpSurf3D(p - e.xyy),
                      bumpSurf3D(p - e.yxy),
                      bumpSurf3D(p - e.yyx) )-ref)/e.x;
    grad -= nor*dot(nor, grad);
    return normalize( nor + grad*bumpfactor );
}
float softShadow(in vec3 ro, in vec3 rd, in float start, in float end, in float k){
    float shade = 1.0;
    const int maxIterationsShad = 10;
    float dist = start;
    float stepDist = end/float(maxIterationsShad);
    for (int i=0; i<maxIterationsShad; i++){
        float h = map(ro + rd*dist);
        shade = min(shade, smoothstep(0., 1., k*h/dist));
        dist += clamp(h, .2, stepDist);
        if (abs(h)<0.001 || dist > end) break;
    }
    return min(max(shade, 0.) + .1, 1.);
}
float calculateAO( in vec3 p, in vec3 n)
{
	float ao = 0.0, l;
	const float nbIte = 6.0;
    const float maxDist = 3.;
    for(float i=1.; i< nbIte+.5; i++ ){
        l = (i*.66 + hash(i)*.34)/nbIte*maxDist;
        ao += (l - map( p + n*l ))/(1.+ l);
    }
    return clamp( 1.-ao/nbIte, 0., 1.);
}
vec3 getSky(){ return vec3(2., 1.4, .7); }
float trig3(in vec3 p){
    p = cos(p*2. + (cos(p.yzx) + 1.)*1.57);
    return dot(p, vec3(0.1666)) + 0.5;
}
float trigNoise3D(in vec3 p){
  const mat3 m3RotTheta = mat3(0.25, -0.866, 0.433, 0.9665, 0.25, -0.2455127, -0.058, 0.433, 0.899519 )*1.5;
	float res = 0.;
  float t = trig3(p*3.14159265);
   p += (t);
  p = m3RotTheta*p;
  res += t;
  t = trig3(p*3.14159265);
   p += (t)*0.7071;
  p = m3RotTheta*p;
  res += t*0.7071;
  t = trig3(p*3.14159265);
	res += t*0.5;
	return res/2.2071;
}
float hash31(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)))*43758.5453); }
float getMist(in vec3 ro, in vec3 rd, in vec3 lp, in float t){
    float mist = 0.;
    ro += rd*t/3.;
    for (int i = 0; i<3; i++){
        float sDi = length(lp-ro)/FAR;
	    float sAtt = 1./(1. + sDi*0.1 + sDi*sDi*0.01);
        mist += trigNoise3D(ro/2.)*sAtt;
        ro += rd*t/3.;
    }
    return clamp(mist/1.5 + hash31(ro)*0.1-0.05, 0., 1.);
}
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
	rd.xy = rot2( path(lookAt.z).x/64. )*rd.xy;
    vec3 lp = vec3(FAR*.5, FAR, FAR) + vec3(0, 0, ro.z);
    float t = trace(ro, rd);
    vec3 sky = getSky();
    vec3 col = sky;
    vec3 sp = ro+t*rd;
    float pathHeight = sp.y-path(sp.z).y;
    if (t < FAR){
        vec3 sn = normal( sp );
        vec3 ld = lp-sp;
        ld /= max(length(ld), 0.001);
        const float tSize = 1./4.;
        sn = doBumpMap(sp, sn, .75/(1. + t/FAR*.25));
        float bf = (pathHeight + 5. < 0.)?  .05: .025;
        sn = doBumpMap(iChannel0, sp*tSize, sn, bf/(1. + t/FAR));
        float shd = softShadow(sp, ld, 0.05, FAR, 8.);
        float ao = calculateAO(sp, sn);
        float dif = max( dot( ld, sn ), 0.0);
        float spe = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 5.);
        float fre = clamp(1.0 + dot(rd, sn), 0.0, 1.0);
		float Schlick = pow( 1. - max(dot(rd, normalize(rd + ld)), 0.), 5.0);
		float fre2 = mix(.2, 1., Schlick);
        float amb = fre*fre2*.7 + .05;
        col = clamp(mix(vec3(1.152, 0.4275,.153), vec3(.225, 0.05985, 0.0153), -sn.y*.5 + pathHeight*.5 + 1.75), vec3(.9, 0.534375, 0.239), vec3(.9, .855, .765));
        col = smoothstep(-.5, 1., tex3D(iChannel0, sp*tSize, sn)*2.)*(col + vec3(.225, .21375, .19125));
        col += smoothstep(0., 1., -pathHeight - 5.5)*fre*.25;
        col += getSky()*fre*fre2;
        col = (col*(dif + .1) + vec3(1)*fre2*spe)*shd*ao + amb*pow(col, vec3(2.));
    }
	float dust = getMist(ro, rd, lp, t)*(1.-clamp((pathHeight - 5.)*.125, 0., 1.));
    sky = getSky()*mix(1., .75, dust);
    col = mix(col, sky, min(t*t*1.5/FAR/FAR, 1.));
    u = uv;
    col = min(col, 1.)*pow( 16.0*u.x*u.y*(1.0-u.x)*(1.0-u.y) , .125);
	  gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1);
}`,
  },
});

const DesertPassage = ({ time }) => (
  <Node
    shader={shaders.desertPassage}
    uniforms={{
      iGlobalTime: time / 1000,
      iChannel0: shadertoyTex17jpg,
    }}
  />
);

export const DesertPassageLoop = timeLoop(DesertPassage, { frameRate: 30 });

export default ({ width }) => (
  <Surface style={{ width, height: width }}>
    <DesertPassageLoop />
  </Surface>
);
