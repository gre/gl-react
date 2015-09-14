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
- **...any other props** get directly passed to the underlying view. *(this feature is deprecated and will eventually be removed. Prefer using a container on top for things like events and styles)*

## Uniform types

Here is the correspondence of GLSL and JavaScript types.

- `int`, `float`, `bool` : Number (e.g: `42`).
- `sampler2D` : either the image URL (String) OR an Object with an `uri` (in React Native, `require("image!id")` is also supported, the format is then exactly like the `source` prop of `React.Image`). Virtual DOM is also allowed, see [GL.Uniform][Uniform.md] for more information.
- `vecN`,`ivecN`,`bvecN` where N is {2,3,4} : an array of N Number (e.g: `[1, 2, 3.5]` for a `vec3`).
- `matN` : an array of N*N Number.

Complex struct types and uniform array **are not** currently supported.

## Note on textures

Images given to uniforms props are always loaded as they are. If you want resize/crop features, you can use an `React.Image` inside a `GL.Uniform`.
