# GL.Node

`GL.Node` is a React Component that describes a given shader with uniforms (parameters to send to the shader).

**Quick Examples:**

Describe a "static" shader (always render the same):

```js
<GL.Node shader={shaders.myEffect} />
```

Describe a shader with uniform parameters:

```js
<GL.Node
  shader={shaders.myEffect2}
  uniforms={{
    floatValue: 0.5,
    vec3Value: [ 1, 0.5, 0.5 ]
  }} />
  /*
  // in myEffect2:
  uniform float floatValue;
  uniform vec3 vec3Value;
  */
```

Renders a shader with an image (texture):

```js
<GL.Node
  shader={shaders.myEffect3}
  uniforms={{
    textureName: "http://..."
  }}
/>
  /*
  // in myEffect3:
  uniform sampler2D textureName;
  */
```

## Props

- **`shader`** *(id created by GL.Shaders.create)* or *(inline object)* **(required)**: The shader to use for rendering the `GL.Node`.
- **`width`** and **`height`** *(Number)* **(optional)**: the resolution in which the shader will be rendered. By default the resolution is inherited from parent GL.Node or parent Surface. You can have a tree of effects which uses different resolution quality (for instance it can make sense for Blur to reduce the framebuffer size).
- **`pixelRatio`** *(Number)*: the pixel ratio to use for this GL.Node and sub-tree. By default it is inherited from parent.
- **`uniforms`** *(object)*: an object that contains all uniform parameters to send to the shader. The key is the uniform name and the value is whatever value that makes sense for the uniform's type (see below).
- **`preload`** *(bool)*: specify if all images used in uniforms in current GL.Node and all children should be waited before rendering the effect. `false` by default, this behavior should be explicitly enabled. (not that this can also be set at the Surface level)
- **`onShaderCompile`** *(function)*: a function called **after each `render()`** allowing to track the compilation state. It is called with 2 parameters: error (node callback style) and result. result is an object giving shader types information, for instance: `{ uniforms: { value: "float" } }`. The default implementation is to `console.error` if there is an error, providing onShaderCompile will overrides this.

## Inline shader support

```js
<GL.Node
  shader={{
    frag: "..."
  }}
  ...
/>
```

This allows to define a shader inline. The difference with a shader created with `GL.Shaders.create` is that the shader will be destroyed when the Node disappears.

`gl-react` factorizes duplicated shaders so you don't have to worry about performance issues for inline shaders. It also counts shaders reference and garbage collects them when not anymore used (in a debounced way).

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
- an Object with an `uri` image URL. This is React Native format (same format as the `source` prop of `React.Image`).
- Virtual DOM of any content to be rasterized, see [GL.Uniform][Uniform.md] for more information.
- **(only in gl-react-dom)**: a `ndarray` image data value. This allows to gives computed value as a texture. *For more information on accepted `ndarray` formats, checkout [gl-texture2d documentation](https://github.com/stackgl/gl-texture2d#var-tex--createtexturegl-array)*.

> In React Native, local images should also work with
```js
const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
const uniformValue = resolveAssetSource(require("./Image.jpg"))
```

---

**N.B.:** For now, following feature only works in `gl-react-dom` and for `ndarray` format.

Finally, you can also give a `{value, opts}` object where `value` is one of previous formats and `opts` is an object that can contains these options:
- `disableLinearInterpolation`: disable the interpolation when using `texture2D` in the shader. (false by default)

Example: `{ value: ndarray(...), opts: { disableLinearInterpolation: true } }`

> We will progressively support more options and on more formats and implementations in next versions of gl-react-dom.
