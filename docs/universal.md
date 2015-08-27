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

  class MyEffect extends GL.Component {
    render () {
      const { width, height, value, children } = this.props;
      return <GL.View
        shader={shaders.myEffect}
        width={width}
        height={height}
        uniforms={{ value }}>
        <GL.Target uniform="tex">{children}</GL.Target>
      </GL.View>;
    }
  }

  return MyEffect;
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

```
const MyEffect = require("gl-react-myeffect/react");
```

or

```
const MyEffect = require("gl-react-myeffect/react-native");
```
