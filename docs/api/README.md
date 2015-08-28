# The API

```js
var GL = require("gl-react");
// OR
var GL = require("gl-react-native");
```

## [GL.Shaders.create](Shaders.create.md)

`GL.Shaders.create(spec)` allows to create shaders that can be used later in GL.View component.

## [GL.View](View.md)

`GL.View` is a React Component that renders a given shader with uniforms (parameters to send to the shader).

## [GL.Target](Target.md)

*(advanced)* `GL.Target` allows to render a shader with any content (any React Native component rasterized as a uniform texture).

## [GL.Component](Component.md)

`GL.Component` is the class to extends to implement a GL component.
