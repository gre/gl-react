import { WebGLView } from "react-native-webgl";
import { Surface } from "gl-react-native";
import { setRuntime } from "cookbook-rn-shared/lib/gl-react-implementation";
setRuntime({
  name: "gl-react-native",
  EXGLView: WebGLView,
  Surface,
  endFrame: gl => gl.getExtension("RN").endFrame(),
  loadThreeJSTexture: (gl, src, texture, renderer) => {
    var properties = renderer.properties.get(texture);
    gl
      .getExtension("RN")
      .loadTexture({ yflip: true, image: src })
      .then(({ texture }) => {
        properties.__webglTexture = texture;
        properties.__webglInit = true;
        texture.needsUpdate = true;
      });
  }
});
