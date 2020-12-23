//@flow
import GLSL from "./GLSL";
import Shaders from "./Shaders";

export default Shaders.create({
  copy: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t,uv);
}`,
  },
}).copy;
