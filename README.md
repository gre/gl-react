# gl-react

WebGL bindings for react to implement complex graphics and image effects, in VDOM descriptive paradigm.

### HelloGL Gist

```js
const React = require("react");
const GL = require("gl-react");

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`
  }
});

class HelloGL extends React.Component {
  render () {
    const { width, height } = this.props;
    return <GL.View
      shader={shaders.helloGL}
      width={width}
      height={height}
    />;
  }
}
```

![](https://cloud.githubusercontent.com/assets/211411/9386550/432492c6-475c-11e5-9328-f3d5187298c1.jpg)

## Installation

```
npm i --save gl-react
```

## Docs and difference with `gl-react-native`

**`gl-react` adopts the same API of `gl-react-native`, therefore you can read
[gl-react-native documentation](https://github.com/ProjectSeptemberInc/gl-react-native/tree/master/docs).**

However, here are the few differences:

### Texture format

Instead of adopting React Native `{uri: "http://..."}` format, you can simply set a `"http:..."` as a texture uniform, the `{uri}` format is still supported for compatibility purpose.

### GL.Target support

`GL.Target` have a more limited support because the web does not allow to draw DOM element in Canvas.

Only one child is supported per `GL.Target` and it MUST be either: an `<img />`, a `<video />` or a `<canvas />`.


## Advanced Effects demo

[![](https://cloud.githubusercontent.com/assets/211411/9387055/de7a4732-475e-11e5-8bc3-e86e48814097.png)](http://projectseptemberinc.github.io/gl-react)
