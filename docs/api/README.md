# The API

The library `gl-react` share most of the common code and exposes **`{ Node, Uniform, Shaders, createComponent }`**.

Both `gl-react-dom` and `gl-react-native` depends on `gl-react` and exposes the **`{ Surface }`** implementation.

```js
const GL = require("gl-react");
const { Surface } = require("gl-react-native" /*! OR !*/ "gl-react-dom");
```

## [GL.Shaders.create](Shaders.create.md)

`GL.Shaders.create(spec)` allows to create shaders that can be used later in GL.Node component.

## [GL.Node](Node.md)

`GL.Node` is a React Component that describes a shader with uniforms (parameters to send to the shader).

## [Surface](Surface.md)

`Surface` is a React Component that renders a `GL.Node` tree with OpenGL (or WebGL depending on the implementation).

## [GL.Uniform](Uniform.md)

*(advanced)* `GL.Uniform` allows to render a shader with any content (any React Native component rasterized as a uniform texture).

## [GL.createComponent](createComponent.md)

`GL.createComponent` is the class to extends to implement a GL component.
