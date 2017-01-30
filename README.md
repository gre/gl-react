> **NB:** This is gl-react v3. For gl-react v2, please see [ProjectSeptemberInc/gl-react](https://github.com/ProjectSeptemberInc/gl-react).

> [gre/gl-react](https://github.com/gre/gl-react) repository is a complete rewrite of [ProjectSeptemberInc/gl-react](https://github.com/ProjectSeptemberInc/gl-react) library (gl-react v2).
It plans to be the gl-react v3.
We keep both repository at same time because (1) this work is not yet finished and (2) this repository is now a "multi libraries" repository (it's just easier to maintain that way).

See also this article: http://greweb.me/2016/12/gl-react-v3/ .

## v3 alpha: development in progress

- [x] gl-react, universal implementation
- [x] gl-react-dom, DOM implementation
- [x] gl-react-headless, Node.js implementation
  - [x] tests: 100% test coverage!
- [x] gl-react-exponent, React Native via Exponent implementation
- [ ] gl-react-native, React Native standalone implementation

**The main remaining work of v3 is the React Native implementation**:

We are relying on **Exponent's GLView** to implement the WebGL layer. The implementation is still very young and experimental (only implement a subset of WebGL), but as soon as this implementation guarantees a good conformance, the library should just work! **I encourage everyone to contribute to make Exponent WebGL implementation robust**, independently from the library you use at the end (Three.js / Pixi.js / regl / gl-react / whatever!).

To track the status of React Native implementation, please see https://github.com/gre/gl-react/issues/74

---

<img width="32" alt="icon" src="https://cloud.githubusercontent.com/assets/211411/9813786/eacfcc24-5888-11e5-8f9b-5a907a2cbb21.png"> gl-react
========

`gl-react` is a [React](https://facebook.github.io/react/) library to write and compose WebGL shaders. *Implement complex effects by composing React components.*

This universal library must be coupled with one of the concrete implementations:

- [`gl-react-dom`](packages/gl-react-dom/) for React DOM (web using WebGL).
- **unfinished** [`gl-react-native`](packages/gl-react-native/) for React Native (iOS/Android via OpenGL).
- [`gl-react-headless`](packages/gl-react-headless/) for Node.js (used for testing for now)

## Links

- [Cookbook, examples, API](https://gl-react-cookbook.surge.sh)
- [![Join the chat at https://gitter.im/gl-react/Lobby](https://badges.gitter.im/gl-react/Lobby.svg)](https://gitter.im/gl-react/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## References

- [GLSL spec](https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf)
- ['the books of shaders'](https://thebookofshaders.com)
- [shader-school workshop](https://www.npmjs.com/package/shader-school)

## Gist

```js
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
const shaders = Shaders.create({
  helloBlue: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`
  }
});
class HelloBlue extends React.Component {
  render() {
    const { blue } = this.props;
    return <Node
      shader={shaders.helloBlue}
      uniforms={{ blue }}
    />;
  }
}
```

import the correct implementation,

```js
import {Surface} from "gl-react-dom"; // for React DOM
import {Surface} from "gl-react-exponrnt"; // for React Native via Exponent GLView
import {Surface} from "gl-react-native"; // for React Native
import {Surface} from "gl-react-headless"; // for Node.js!
```

and this code...

```js
<Surface width={300} height={300}>
  <HelloBlue blue={0.5} />
</Surface>
```

...renders:

![](https://cloud.githubusercontent.com/assets/211411/9386550/432492c6-475c-11e5-9328-f3d5187298c1.jpg)


## Features

- **React, VDOM and immutable paradigm**: OpenGL is a low level imperative and mutable API. This library takes the best of it and exposes it in an immutable, descriptive way with React.
- **React lifecycle** allows partial GL re-rendering. Only a React Component update will trigger a redraw. Each Node holds a framebuffer state that get redrawn when component updates and schedule a Surface reflow.
- **Developer experience**
  - React DevTools works like on DOM and allows you to inspect and debug your stack of effects.
- **Uniform bindings**: bindings from JavaScript objects to OpenGL GLSL language types (bool, int, float, vec2, vec3, vec4, mat2, mat3, mat4, sampler2D...)
- An **extensible texture loader** that allows to support any content that goes in the shader as a sampler2D texture.
  - support for images
  - support for videos (currently `gl-react-dom`)
  - support for canvas (`gl-react-dom`)
- **flowtype** support.
- headless tests with Jest. We have reached 99.9% test coverage!
- Modular, Composable, Sharable. Write shaders once into components that you re-use everywhere! At the end, users don't need to write shaders.

## Atom nice GLSL highlighting

If you are using Atom Editor, you can have JS inlined GLSL syntax highlighted.

![](https://cloud.githubusercontent.com/assets/211411/20623048/0527cce2-b306-11e6-85ee-5020be994c10.png)

**To configure this:**

- add `language-babel` package.
- Configure `language-babel` to add `GLSL:source.glsl` in settings "*JavaScript Tagged Template Literal Grammar Extensions*".
- (Bonus) Add this CSS to your *Atom > Stylesheet*:
```css
/* language-babel blocks */
atom-text-editor::shadow .line .ttl-grammar {
  /* NB: designed for dark theme. can be customized */
  background-color: rgba(0,0,0,0.3);
}
atom-text-editor::shadow .line .ttl-grammar:first-child:last-child {
  display: block; /* force background to take full width only if ttl-grammar is alone in the line. */
}
```
