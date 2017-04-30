import EXGLView from "gl-react-native/lib/EXGLView";
import Image from "gl-react-native/lib/Image";
import { Surface } from "gl-react-native";
import { setRuntime } from "cookbook-rn-shared/lib/gl-react-implementation";
setRuntime({
  name: "gl-react-native",
  EXGLView,
  Surface,
  Image,
});
