# GL.Uniform

`GL.Uniform` is an helper for describing content uniform that you can put in children of a `GL.Node`.

The child of a `GL.Uniform` is the uniform value / content to rasterize:

It can be an image, a video, a complex content (including texts and images...) or even another `GL.Component` (which allows to **compose and stack effects**).

> `<GL.Uniform name="foo">{value}</GL.Uniform>` is an alternative syntax to passing `{ foo: value }` in parent `GL.Node` uniforms props. It is just more convenient for VDOM uniform value.

**Example:**

```html
<GL.Node shader={shaders.myEffect3}>
  <GL.Uniform name="textureName">
    ...children
  </GL.Uniform>
</GL.Node>
```

## Props

- **`uniform`** *(string)* **(required)**: The name of the shader texture uniform to use for rendering the content.
- **`children`** *(any)* **(required)**: The content to use as a uniform texture. It can be:
  - an image URL.
  - a `GL.Component` or `GL.Node` (this allows to stack effects).
  - any content to rasterize *(this feature is advanced, see below for support detail)*.


## Content rasterization support

> **N.B.** The content rasterization remains experimental. The complexity to implement it is to know when content get refreshed (for instance when an image loads,...). When content to rasterize is provided, the current implementation will ALWAYS re-draw the GLView after each Virtual DOM `render()`, so if you can observe a specific content event (e.g: load) you may want to `forceUpdate` or use a `state`. This is currently quite slow on Android, works ok on iOS and works **really good on Web**.

### Using `gl-react-native`

In `gl-react-native`, **uniforms can contain any content**!
The resulting UIView will be rasterized and rendered into the GL pipeline as a texture.

> **NB: Support of this is still experimental and CPU consuming.**

**Example (adapted from Simple/):**

```html
<HueRotate hue={hue}>
  <Image source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }} style={{ width: 256, height: 244 }} />
  <Text style={styles.demoText1}>Throw me to the wolves</Text>
  <Text style={styles.demoText2}>{text}</Text>
</HueRotate>
```

and here is render implementation of `HueRotate`

```html
<GL.Node shader={shaders.hueRotate} uniforms={{ hue }}>
  <GL.Uniform name="tex">{children}</GL.Uniform>
</GL.Node>
```

which can also be written as:

```html
<GL.Node
  shader={shaders.hueRotate}
  uniforms={{
    hue,
    tex: children
  }}
/>
```

### Images and React Native

if you use local images that you `require("./image.png")` you will have to wrap it in `resolveAssetSource(...)` because otherwise it's a number and `gl-react` won't understand it.

You can `import {resolveAssetSource} from "gl-react-native"`.

Also, if you just want to gets an image in a uniform, we recommend you not to use the React Native `Image` but instead to use the URL format or to use a library like `gl-react-image`.


### Using `gl-react-dom`

`GL.Uniform` have a limited support in `gl-react-dom` because the web does not allow to rasterize any DOM element.
However, when it does work, it should works very efficiently thanks to the great web. (e.g; drawing a video in WebGL is really optimized and efficient).

Only one child is supported per `GL.Uniform` and it MUST be either: an `<img />`, a `<video />` or a `<canvas />`.

If you want to implement effect over complex content, we highly recommend you to use  [`react-canvas`](https://github.com/Flipboard/react-canvas).

**Same example (adapted from Simple/):**

```js
const {Surface: CanvasSurface, Image, Text} = require("react-canvas");
```

```html
<HueRotate hue={hue}>
  <CanvasSurface width={width} height={height} top={0} left={0}>
    <Image src="http://i.imgur.com/qVxHrkY.jpg"
      style={{ width: 256, height: 244, top: 0, left: 0 }} />
    <Text style={styles.demoText1}>Throw me to the wolves</Text>
    <Text style={styles.demoText2}>{text}</Text>
  </CanvasSurface>
</HueRotate>
```

> Note how the `react-canvas` is very close to React Native's code.
