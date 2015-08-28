# GL.Target

`GL.Target` allows to render a shader with any content. It can be an image, a video, a complex content (including texts and images...) or even another `GL.Component` (which allows to **compose and stack effects**).

**Example:**

```html
<GL.View
    shader={shaders.myEffect3}
    width={200}
    height={100}>

  <GL.Target uniform="textureName">

    ...children

  </GL.Target>

</GL.View>
```

## Props

- **`uniform`** *(string)* **(required)**: The name of the shader texture uniform to use for rendering the content.
- **`children`** *(any)* **(required)**: The content to use as a uniform texture. It can be:
  - an image URL (this is like giving it in `GL.View`'s `uniforms` object).
  - a `GL.Component` or `GL.View` (this allows to stack effects).
  - any content to rasterize *(this feature is advanced, see below for support detail)*.


## Content rasterization support

> **N.B.** The content rasterization remains experimental. The complexity to implement it is to know when content get refreshed (for instance when an image loads,...). When content to rasterize is provided, the current implementation will ALWAYS re-draw the GLView after each Virtual DOM `render()`, so if you can observe a specific content event (e.g: load) you may want to `forceUpdate` or use a `state`.

### Using `gl-react-native`

In `gl-react-native`, `GL.Target` can contain any content!
The resulting UIView will be rasterized and rendered into the GL View.

**Example (adapted from Simple/):**

```html
<HueRotate width={width} height={height} hue={hue}>
  <Image source={{ uri: "http://i.imgur.com/qVxHrkY.jpg" }}
    style={{ width: 256, height: 244 }} />
  <Text style={styles.demoText1}>Throw me to the wolves</Text>
  <Text style={styles.demoText2}>{text}</Text>
</HueRotate>
```

(and here is render implementation of `HueRotate`)

```html
<GL.View
  shader={shaders.hueRotate}
  width={width}
  height={height}
  uniforms={{ hue }}>
  <GL.Target uniform="tex">{children}</GL.Target>
</GL.View>
```


### Using `gl-react`

`GL.Target` have a limited support in `gl-react` because the web does not allow to rasterize any DOM element.

Only one child is supported per `GL.Target` and it MUST be either: an `<img />`, a `<video />` or a `<canvas />`.

If you want to implement effect over complex content, we highly recommend you to use  [`react-canvas`](https://github.com/Flipboard/react-canvas).

**Same example (adapted from Simple/):**

```html
<HueRotate width={width} height={height} hue={hue}>
  <Surface width={width} height={height} top={0} left={0}>
    <Image src="http://i.imgur.com/qVxHrkY.jpg"
      style={{ width: 256, height: 244, top: 0, left: 0 }} />
    <Text style={styles.demoText1}>Throw me to the wolves</Text>
    <Text style={styles.demoText2}>{text}</Text>
  </Surface>
</HueRotate>
```

> Note how the `react-canvas` is very close to React Native's code.
