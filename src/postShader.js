const Shaders = require("./Shaders");
const NAME = "(gl-react-post)";
module.exports = Shaders.create({
  [NAME]: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t,uv);
}`
  }
})[NAME];
