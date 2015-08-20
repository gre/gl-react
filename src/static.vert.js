module.exports = `
attribute vec2 _p;
varying vec2 uv;
void main() {
  gl_Position = vec4(_p,0.0,1.0);
  uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}
`;
