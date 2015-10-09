# Sharing code across gl-react and gl-react-native

Both `gl-react` and `gl-react-native` have the same API (technically they are both using `gl-react-core`).

Here is the pattern to write an *universal* component that targets both platforms.

**index.js**

```js
module.exports = function (React, GL) {

  const shaders = GL.Shaders.create({
    myEffect: {
      frag: `
precision highp float;
varying vec2 uv;

uniform float value;
uniform sampler2D tex;

void main () {
  gl_FragColor = value * texture2D(tex, uv);
}
`
    }
  });

  return GL.createComponent(
    ({ value, children: tex, ...rest }) =>
    <GL.View
      {...rest}
      shader={shaders.myEffect}
      uniforms={{ value, tex }}
    />,
    { displayName: "???" });
}
```

**react.js**
```js
module.exports = require(".")(require("react"), require("gl-react"));
```

**react-native.js**
```js
module.exports = require(".")(require("react-native"), require("gl-react-native"));
```


Then on the usage part, let's say you have published your module as `gl-react-myeffect`,
you can use:

```js
const MyEffect = require("gl-react-myeffect/react");
```

or

```js
const MyEffect = require("gl-react-myeffect/react-native");
```

> As you can see, this is not perfect but we might improve it when both react-dom and react-native will depends on react.
