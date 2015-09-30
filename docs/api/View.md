# GL.View

`GL.View` is a React Component that renders a given shader with uniforms (parameters to send to the shader).

**Quick Examples:**

Renders a "standalone" shader:

```js
render () {
  return <GL.View
    shader={shaders.myEffect}
    width={200}
    height={100} />;
}
```

Renders a shader with uniform parameters:

```js
render () {
  return <GL.View
    shader={shaders.myEffect2}
    width={200}
    height={100}
    uniforms={{
      floatValue: 0.5,
      vec3Value: [ 1, 0.5, 0.5 ]
    }} />;
    /*
    // in myEffect2:
    uniform float floatValue;
    uniform vec3 vec3Value;
    */
}
```

Renders a shader with an image (texture):

```js
render () {
  return <GL.View
    shader={shaders.myEffect3}
    width={200}
    height={100}
    uniforms={{
      textureName: {{ uri: "...url" }} // RN convention
    }} />;
    /*
    // in myEffect3:
    uniform sampler2D textureName;
    */
}
```


## Props

- **`shader`** *(id created by GL.Shaders.create)* **(required)**: The shader to use for rendering the `GL.View`.
- **`width`** and **`height`** *(Number)* **(required)**: the size of the view.
- **`uniforms`** *(object)*: an object that contains all uniform parameters to send to the shader. The key is the uniform name and the value is whatever value that makes sense for the uniform's type (see below).
- **`opaque`** *(bool)*: specify if the view should be opaque. By default, it is true, meaning that the GL View won't support texture opacity and alpha channel.
- **`preload`** *(bool)*: specify if the view should initially not render until all images are loaded. `false` by default, this behavior should be explicitly enabled.
- **`onLoad`** *(function)*: callback called when the view is ready (has loaded all images in case of preload).
- **`onProgress`** *(function)*: callback to track the progress of a loading (in case of preload). it receives `{progress,loaded,total}` (in React Native, this object is in `{nativeEvent}`).
- **`autoRedraw`** *(bool)*: enable the continuous rendering for dynamic content (like a `<canvas/>`, `<video/>` or any dynamic UI (e.g: a UI component in React Native context)). default is false. This is more performant that doing yourself a `render()` loop but don't abuse its usage: you should use it when content always changes or if you can't observe changes.
- **`visibleContent`** *(bool)*: Enable the visibility of the rasterized content under the GL view. Main use-case is to allow to make that content to catch events (combined with `eventsThrough`), it is also possible to make your canvas transparent to see the underlying content. N.B: This feature only works with **a single content**. default is false.
- **`eventsThrough`** *(bool)*: Enable that all interaction events (mouse, touch) are not intercepted by the GL view but by what's under. If `visibleContent` is true, the content will intercept them. default is false.
- **...any other props** get directly passed to the underlying view.

## Uniform types

Here is the correspondence of GLSL and JavaScript types.

- `int`, `float`, `bool` : Number (e.g: `42`).
- `sampler2D` : one of the possible types described bellow.
- `vecN`,`ivecN`,`bvecN` where N is {2,3,4} : an array of N Number (e.g: `[1, 2, 3.5]` for a `vec3`).
- `matN` : an array of N*N Number.

Complex struct types and uniform array **are not** currently supported.

### `sampler2D` possible values

A texture uniform value can be one of these formats:

-  an image URL (String).
- an Object with an `uri` image URL. This is React Native format (same format as the `source` prop of `React.Image`). `require("image!localImage")` is also supported.
- Virtual DOM of any content to be rasterized, see [GL.Uniform][Uniform.md] for more information.
- **(only in gl-react)**: a `ndarray` image data value. This allows to gives computed value as a texture.

---

**.N.B:** For now, following feature only works in `gl-react` and for `ndarray` format.

Finally, you can also give a `{value, opts}` object where `value` is one of previous formats and `opts` is an object that can contains these options:
- `disableLinearInterpolation`: disable the interpolation when using `texture2D` in the shader. (false by default)

Example: `{ value: ndarray(...), opts: { disableLinearInterpolation: true } }`

> We will progressively support more options and on more formats and implementations in next versions of gl-react.
