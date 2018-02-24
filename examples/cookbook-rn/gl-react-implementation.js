import { WebGLView } from "react-native-webgl";
import { Surface } from "gl-react-native";

export const name = "gl-react-native";
export const EXGLView = WebGLView;
export { Surface };
export const endFrame = gl => gl.getExtension("RN").endFrame();
export const loadThreeJSTexture = (gl, src, texture, renderer) => {
  var properties = renderer.properties.get(texture);
  gl
    .getExtension("RN")
    .loadTexture({ yflip: true, image: src })
    .then(({ texture }) => {
      properties.__webglTexture = texture;
      properties.__webglInit = true;
      texture.needsUpdate = true;
    });
};
