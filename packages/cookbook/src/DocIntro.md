# gl-react API documentation

`gl-react` is a [React](https://facebook.github.io/react/) library to write and compose WebGL shaders.

This universal library must be coupled with one of the concrete implementations:

- [`gl-react-dom`](https://github.com/gre/gl-react/tree/master/packages/gl-react-dom/) for React DOM (web using WebGL).
- [`gl-react-expo`](https://github.com/gre/gl-react/tree/master/packages/gl-react-expo/) for React Native via Expo WebGL implementation.
- [`gl-react-native`](https://github.com/gre/gl-react/tree/master/packages/gl-react-native/), for React Native (standalone library, iOS/Android via OpenGL).
- [`gl-react-headless`](https://github.com/gre/gl-react/tree/master/packages/gl-react-headless/) for Node.js (used for testing for now)

[![](https://cloud.githubusercontent.com/assets/211411/9386550/432492c6-475c-11e5-9328-f3d5187298c1.jpg)](/hellogl)

```js
<Surface width={300} height={200}>
  <Node shader={shaders.helloGL} />
</Surface>
```

There are two primitive components: [Surface](#surface) and [Node](#node).
