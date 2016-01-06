# GL.Shaders.create

`GL.Shaders.create(spec)` allows to create shaders that can be used later in *GL.Node* component.


**Example usage:**

```js
var shaders = GL.Shaders.create({
  myEffect: {
    frag: `
void main () {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
}
    `
  },
  ...
})

// Use it later:
<GL.Node shader={shaders.myEffect} ... />
```

`GL.Shaders.create` is inspired from ReactNative's `StyleSheet.create`: it creates an object with key-value and will returns an object with the same keys and where the values can be used in the Virtual DOM.

The value of each Shader is an object with a `frag` field: the fragment GLSL code.

## Shaders compilation callback

`GL.Shaders.create(spec, `**`onAllCompiled`**`)`

By default, `GL.Shaders.create` will `console.error` each shader that fails.
If you want to override this and hook to shader compilation status, you can provide a second parameter to `create` that will be called once with 2 parameters: errors and results. errors is null if all shaders are successful or an object describing the errors per shader. results is an object containing the shader types information per shader.

## Shaders factorization and garbage collection

gl-react factorizes duplicated shaders: when you define a shader, if it already exists the existed one is used to improve performance and memory.
It also counts shaders reference and garbage collects them when not anymore used (in a debounced way). This only occurs when you use inline shaders, it is not possible to destroy shaders created with `Shaders.create`.

## About Shaders

There are two kinds of OpenGL Shaders: vertex and fragment shaders.
The vertex shader iterates over polygons and computes pixel positions, the fragment shaders iterates over pixels and computes a color.

In current version of `gl-react-dom` and `gl-react-native`, the vertex shader is implemented for you
and you only have to implement the fragment shader.

> This documentation assumes you know the basics of GLSL, the OpenGL Shading Language, if not, feel free to learn [shader-school](https://www.npmjs.com/package/shader-school), read the [specification](https://www.opengl.org/documentation/glsl/) or learn from the examples.
