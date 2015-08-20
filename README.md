# gl-react

WebGL bindings for react to implement complex effects over images in VDOM descriptive paradigm.

## Demo

[![](https://cloud.githubusercontent.com/assets/211411/9384480/0ccb45a4-4751-11e5-845c-de00bfe30b6a.png)](http://projectseptemberinc.github.io/gl-react)

## Docs and difference with `gl-react-native`

`gl-react` adopts the same API of `gl-react-native`, therefore you can read
[gl-react-native documentation](https://github.com/ProjectSeptemberInc/gl-react-native/tree/master/docs).

However, here are the few differences:

### Texture format

Instead of adopting React Native `{uri: "http://..."}` format, you can simply set a `"http:..."` as a texture uniform, the `{uri}` format is still supported for compatibility purpose.

### GL.Target support

`GL.Target` have a more limited support because the web does not allow to draw DOM element in Canvas.

Only one child is supported per `GL.Target` and it MUST be either: an `<img />`, a `<video />` or a `<canvas />`.
