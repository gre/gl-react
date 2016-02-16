# Surface

`Surface` is a React Component that renders a `GL.Node` tree with OpenGL (or WebGL depending on the implementation).

It takes in children one single `GL.Node` OR a **GL Component**. You also must give `width` and `height` in props.

> N.B.: `Surface` is currently the only object exposed by implementations (`gl-react-native` and `gl-react-dom`) as being the only component that concretely renders the graphics to a platform target. All the rest of the API is in `gl-react` which is platform independent.

**Quick Examples:**

Renders a GL.Node:

```html
<Surface width={200} height={100}>
  <GL.Node shader={shaders.myEffect} />
</Surface>
```

Renders a GL component:

```html
<Surface width={200} height={100}>
  <HelloGL />
</Surface>
```

Renders some more complex stack of effects:

```html
<Surface width={200} height={100}>
  <Blur factor={2}>
    <Negative>
      http://i.imgur.com/wxqlQkh.jpg
    </Negative>
  </Blur>
</Surface>
```


## Props of `Surface`

- **`width`** and **`height`** *(Number)* **(required)**: the size of the view.
- **`pixelRatio`** *(Number)*: the pixel ratio to use for the rendering. By default the screen pixel scale will be used.
- **`backgroundColor`** *(object)*: By default is set to black (opaque). Use `"transparent"` when you need opacity.
- **`preload`** *(bool)*: specify if the view should initially not render until all images are loaded. `false` by default, this behavior should be explicitly enabled.
- **`onLoad`** *(function)*: callback called when the view is ready (has loaded all images in case of preload).
- **`onProgress`** *(function)*: callback to track the progress of a loading (in case of preload). it receives `{progress,loaded,total}` (in React Native, this object is in `{nativeEvent}`).
- **`autoRedraw`** *(bool)*: enable the continuous rendering for dynamic content (like a `<canvas/>`, `<video/>` or any dynamic UI (e.g: a UI component in React Native context)). default is false. This is more performant that doing yourself a `render()` loop but don't abuse its usage: you should use it when content always changes or if you can't observe changes.
- **`eventsThrough`** *(bool)*: Enable that all interaction events (mouse, touch) are not intercepted by the GL view but by what's under. If `visibleContent` is true, the content will intercept these events. default is false.
- **`visibleContent`** *(bool)*: Enable the visibility of the rasterized content under the GL view. Main use-case is to allow to make that content to catch events (combined with `eventsThrough`), it is also possible to make your canvas transparent to see the underlying content. N.B: This feature only works with **a single content**. default is false.

## Methods of `Surface`

### `captureFrame(config)`

returns a Promise of snapshot of the Surface.

config is an optional object with:
- `type`: the file type default value is **"png"**, **"jpg"** is also supported. Refer to implementations to see more supported values.
- `quality`: a value from 0 to 1 to describe the quality of the snapshot. 0 means 0% (most compressed) and 1 means 100% (best quality).
- `format`: default is **"base64"**.

Implementation have other specific options:
- in **gl-react-native**, `format: "file"` allows to save to a file. You also need to provide a `filePath` String (you should use `react-native-fs` to knows directory paths). The promise result will be a `file://...` url that you can use in `<Image source={{uri}} />`.
- in **gl-react-dom**, `format: "blob"` allows to get a Blob object in the resulting promise. It is recommended to use instead of `base64` because it doesn't block the JavaScript thread (it uses `canvas.toBlob(cb)` async method). **However, it is only supported by Firefox at the moment.** See [gl-react-dom-static-container](https://github.com/gre/gl-react-dom-static-container/blob/e3f6276871a89474c91b0aa19455eca62cf5264f/src/GLStaticContainer.js#L138-L170) usage if you are interested.
