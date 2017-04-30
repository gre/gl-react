import Expo from "expo";
import Image from "gl-react-expo/lib/Image";
import { Surface } from "gl-react-expo";
import { setRuntime } from "cookbook-rn-shared/lib/gl-react-implementation";
setRuntime({
  name: "gl-react-expo",
  EXGLView: Expo.GLView,
  Surface,
  Image,
});
