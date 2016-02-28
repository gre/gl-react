**[Gitbook documentation](http://projectseptemberinc.gitbooks.io/gl-react/content/) / [Github](https://github.com/ProjectSeptemberInc/gl-react/) / [live demos](http://projectseptemberinc.github.io/gl-react-dom/) / [gl-react-dom](https://github.com/ProjectSeptemberInc/gl-react-dom/) / [gl-react-native](https://github.com/ProjectSeptemberInc/gl-react-native/)** / [#gl-react on reactiflux](https://discordapp.com/channels/102860784329052160/106102146109325312)

# <img width="32" alt="icon" src="https://cloud.githubusercontent.com/assets/211411/9813786/eacfcc24-5888-11e5-8f9b-5a907a2cbb21.png"> gl-react

WebGL/OpenGL bindings for React to implement complex effects over images and content, in the descriptive VDOM paradigm.

`gl-react` allows you to write a fragment shader that covers a component. The shader can render: generated graphics/demos, effects on top of images, effects over content (video, canvas)... anything you can imagine!

`gl-react` is the universal library that have 2 implementations:

- [`gl-react-dom`](https://github.com/ProjectSeptemberInc/gl-react-dom) for React DOM (web using WebGL).
- [`gl-react-native`](https://github.com/ProjectSeptemberInc/gl-react-native) for React Native (iOS and Android using OpenGL).


The library `gl-react` share most of the common code and exposes `{ Node, Uniform, Shaders, createComponent }`.

Both `gl-react-dom` and `gl-react-native` depends on `gl-react` and exposes the `{ Surface }` implementation.

[![](https://github.com/ProjectSeptemberInc/gl-react/raw/master/docs/examples/blur.gif)](http://projectseptemberinc.github.io/gl-react-dom/Examples/Blur/)

## Examples

[Open Examples page](http://projectseptemberinc.github.io/gl-react-dom/) / [Read the code](https://github.com/ProjectSeptemberInc/gl-react-dom/tree/master/Examples).

- [Simple](https://github.com/ProjectSeptemberInc/gl-react-dom/tree/master/Examples/Simple) contains minimal examples, perfect to learn how to use the library. See also the [Related Documentation](http://projectseptemberinc.gitbooks.io/gl-react/content/).
- [SpringCursor](https://github.com/ProjectSeptemberInc/gl-react-dom/tree/master/Examples/SpringCursor) shows usage with [`react-motion`](https://github.com/chenglou/react-motion).
- [AdvancedEffects' Intro](https://github.com/ProjectSeptemberInc/gl-react-dom/blob/master/Examples/AdvancedEffects/src/Intro.js) shows usage with [`react-canvas`](https://github.com/Flipboard/react-canvas).
- [Video](https://github.com/ProjectSeptemberInc/gl-react-dom/blob/master/Examples/Video/index.js) shows usage with the `<video/>` tag.
- [AdvancedEffects's Transition](https://github.com/ProjectSeptemberInc/gl-react-dom/blob/master/Examples/AdvancedEffects/src/Transition.js) shows a minimal interoperability with [GLSL Transitions](http://transitions.glsl.io/).
- [Blur](https://github.com/ProjectSeptemberInc/gl-react-dom/blob/master/Examples/Blur/) shows an advanced example of multi-pass pipeline and also shows usage of [glslify](https://github.com/stackgl/glslify).
- [VideoBlur](https://github.com/ProjectSeptemberInc/gl-react-dom/blob/master/Examples/VideoBlur/) shows multi-pass Blur over Hue over a `<video>`! It demonstrates the "shared computation" of the rendering tree [introduced by 1.0.0](https://github.com/ProjectSeptemberInc/gl-react-dom/releases/tag/v1.0.0).
- [Image Effects](https://github.com/gre/gl-react-image-effects) implements an Image Effects app for Web and Native with a same codebase.

### Some universal GL effects made with `gl-react` (published on NPM)

- [gl-react-blur](https://github.com/gre/gl-react-blur)
- [gl-react-contrast-saturation-brightness](https://github.com/gre/gl-react-contrast-saturation-brightness)
- [gl-react-negative](https://github.com/gre/gl-react-negative)
- [gl-react-hue-rotate](https://github.com/gre/gl-react-hue-rotate)
- [gl-react-color-matrix](https://github.com/gre/gl-react-color-matrix)

### HelloGL Gist

```js
const GL = require("gl-react");
const React = require("react");

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
uniform float blue;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`
  }
});

module.exports = GL.createComponent(
  ({ blue }) =>
  <GL.Node
    shader={shaders.helloGL}
    uniforms={{ blue }}
  />,
  { displayName: "HelloGL" });
```

```js
const { Surface } = require("gl-react-dom"); // in React DOM context
const { Surface } = require("gl-react-native"); // in React Native context
```

```html
<Surface width={511} height={341}>
  <HelloGL blue={0.5} />
</Surface>
```

renders

![](https://cloud.githubusercontent.com/assets/211411/9386550/432492c6-475c-11e5-9328-f3d5187298c1.jpg)

## Focus

- **Virtual DOM and immutable** paradigm: OpenGL is a low level imperative and mutable API. This library takes the best of it and exposes it in an immutable, descriptive way.
- **Performance**
- **Developer experience**: the application doesn't crash on bugs - Live Reload support make experimenting with effects easy (also `gl-react-native`'s version uses React Native error message to display GLSL errors).
- **Uniform bindings**: bindings from JavaScript objects to OpenGL GLSL language types (bool, int, float, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D...)
- **Support for images** as a texture uniform.
- **Support for `<canvas>`, `<video>`** as a texture uniform.

`gl-react` primary goal is not to do 3D. The library currently focus on stacking fragment shaders (that runs with static vertex) and exposes these features in a simple API applying React paradigm. This already unlock a lot of capabilities shown in the examples.

3D graphics implies more work on vertex shader and vertex data. We might eventually implement this. In the meantime, if this is a use-case for you, feel free to [comment on this issue](https://github.com/ProjectSeptemberInc/gl-react/issues/6).


## Installation

```
npm i --save gl-react
```

## Influence / Credits

- [stack.gl](http://stack.gl/) approach (`gl-shader`, `gl-texture2d`, `gl-fbo` are library directly used by `gl-react-dom`)
- [GLSL.io](http://glsl.io/) and [Diaporama](https://github.com/gre/diaporama)

## [Read Full Documentation](http://projectseptemberinc.gitbooks.io/gl-react/content/)
