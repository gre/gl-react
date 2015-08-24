# gl-react

OpenGL bindings for react-native to implement complex effects over images and components, in the descriptive VDOM paradigm.

More technically, gl-react-native allows you to write a fragment shader that covers a component. The shader can render: generated graphics/demos, effects on top of images, effects over any UI content... anything you can imagine!

There's also a [`gl-react-native`](https://github.com/ProjectSeptemberInc/gl-react-native) version gl-react with the same API.

## Examples

Open [Examples page](http://projectseptemberinc.github.io/gl-react/) and [read the code](https://github.com/ProjectSeptemberInc/gl-react/tree/master/Examples).

- [Simple](https://github.com/ProjectSeptemberInc/gl-react/tree/master/Examples/Simple) contains minimal examples, perfect to learn how to use the library. See also the [Related Documentation](http://projectseptemberinc.gitbooks.io/gl-react-native/content/).
- [SpringCursor](https://github.com/ProjectSeptemberInc/gl-react/tree/master/Examples/SpringCursor/index.js) shows usage with [`react-motion`](https://github.com/chenglou/react-motion).
- [AdvancedEffects' Intro](https://github.com/ProjectSeptemberInc/gl-react/blob/master/Examples/AdvancedEffects/src/Intro.js) shows usage with [`react-canvas`](https://github.com/Flipboard/react-canvas).
- [Video](https://github.com/ProjectSeptemberInc/gl-react/blob/master/Examples/Video/index.js) shows usage with the `<video/>` tag.
- [AdvancedEffects's Transition](https://github.com/ProjectSeptemberInc/gl-react/blob/master/Examples/AdvancedEffects/src/Transition.js) shows a minimal interoperability with [GLSL Transitions](http://transitions.glsl.io/).atom

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

## Documentation and difference with `gl-react-native`

**`gl-react` adopts the same API of `gl-react-native`, therefore you can read
[gl-react-native documentation](https://github.com/ProjectSeptemberInc/gl-react-native/tree/master/docs).**

### GL.Target limited support

`GL.Target` have a more limited support because the web does not allow to draw DOM element in Canvas.

Only one child is supported per `GL.Target` and it MUST be either: an `<img />`, a `<video />` or a `<canvas />`.

You might want to take a look at [`react-canvas`](https://github.com/Flipboard/react-canvas) for drawing content.


## Influence / Credits

- [stack.gl](http://stack.gl/) approach
- [GLSL.io](http://glsl.io/) and [Diaporama](https://github.com/gre/diaporama)
- Source code of [React Native](https://github.com/facebook/react-native)

