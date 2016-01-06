# gl-react: Universal API

To define an effect, you only need `gl-react`. You don't actually need `<GL.Surface>` that is only reserved to the final user (who composes all effects in one surface).

This is therefore the way to publish [**universal**](https://medium.com/@mjackson/universal-javascript-4761051b7ae9#.6yp7xznn2) GL Effects for web and native.

**index.js**

```js
const GL = require("gl-react");
const React = require("react");

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
});

module.exports = GL.createComponent(
  ({ value, children: tex }) =>
  <GL.Node
    shader={shaders.helloGL}
    uniforms={{ value, tex }}
  />,
  { displayName: "???" });
```

## Usage

With your module is published you have published as `gl-react-myeffect`,
you can then use it like this:

```js
const GL = require("gl-react");
const React = require("react");
const MyEffect = require("gl-react-dom-myeffect");
const {Surface} = require(/* "gl-react-native" or "gl-react-dom" */);

...
<Surface width={200} height={200}>
  <MyEffect value={0.5}>
    ...
  </MyEffect>
</Surface>
```
