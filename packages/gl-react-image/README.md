# gl-react-image

Universal [gl-react](https://github.com/gre/gl-react) image component that implements various `resizeMode` in OpenGL: **cover**, **contain**, **free** and **stretch**.

```jsx
import { Surface } from "gl-react-dom"; // or gl-react-expo / gl-react-native / gl-react-headless
import GLImage from "gl-react-image";

<Surface width={300} height={200}>
  <GLImage source="https://i.imgur.com/uTP9Xfr.jpg" resizeMode="cover" />
</Surface>;
```

## Props

- **`source`** *(required)*: any gl-react texture input (image URL, DOM element, child Node, Bus ref, ...).
- **`resizeMode`**: one of:
  - `"cover"` *(default)*: fills the area, cropping the image. `center` and `zoom` move the crop window, clamped so the image always covers the area.
  - `"free"`: like `"cover"` but without edge clamping; areas outside the image are transparent.
  - `"contain"`: letterboxes the image so it fits entirely in the area.
  - `"stretch"`: distorts the image to the area size.
- **`center`**: `[x, y]` crop window center in image coordinates (default `[0.5, 0.5]`). Only for `"cover"` and `"free"`.
- **`zoom`**: crop window zoom level (default `1`). Only for `"cover"` and `"free"`.

Any other prop is passed through to the underlying gl-react `Node`.

Because GLImage renders a Node, it can be composed anywhere in a gl-react shader tree: use it as the texture input of an effect, or give it effects as `source`.
