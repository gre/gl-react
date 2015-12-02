# Surface

`Surface` is a React Component that renders a `GL.Node` tree with OpenGL (or WebGL depending on the implementation).

It takes in children one single `GL.Node` OR a [GL Component](createComponent.md). You also must give `width` and `height` in props.

> N.B.: `Surface` is currently the only object exposed by implementers (`gl-react-native` and `gl-react-dom`) as being the only component that concretely renders something to a platform target. All the rest of the API is in `gl-react` which is platform independent.

**Quick Examples:**

Renders a GL.Node:

```html
<Surface width={200} height={100}>
  <GL.Node shader={shaders.myEffect} />
</Surface>
```

Renders a GL component:

```html
<Surface width={200} height={100}>
  <HelloGL />
</Surface>
```

Renders some more complex stack of effects:

```html
<Surface width={200} height={100}>
  <Blur factor={2}>
    <Negative>
      http://i.imgur.com/wxqlQkh.jpg
    </Negative>
  </Blur>
</Surface>
```


## Props of `Surface`

- **`width`** and **`height`** *(Number)* **(required)**: the size of the view.
- **`opaque`** *(bool)*: specify if the view should be opaque. By default, it is true, meaning that the GL View won't support texture opacity and alpha channel.
- **`preload`** *(bool)*: specify if the view should initially not render until all images are loaded. `false` by default, this behavior should be explicitly enabled.
- **`onLoad`** *(function)*: callback called when the view is ready (has loaded all images in case of preload).
- **`onProgress`** *(function)*: callback to track the progress of a loading (in case of preload). it receives `{progress,loaded,total}` (in React Native, this object is in `{nativeEvent}`).
- **`autoRedraw`** *(bool)*: enable the continuous rendering for dynamic content (like a `<canvas/>`, `<video/>` or any dynamic UI (e.g: a UI component in React Native context)). default is false. This is more performant that doing yourself a `render()` loop but don't abuse its usage: you should use it when content always changes or if you can't observe changes.
- **`eventsThrough`** *(bool)*: Enable that all interaction events (mouse, touch) are not intercepted by the GL view but by what's under. If `visibleContent` is true, the content will intercept these events. default is false.
- **`visibleContent`** *(bool)*: Enable the visibility of the rasterized content under the GL view. Main use-case is to allow to make that content to catch events (combined with `eventsThrough`), it is also possible to make your canvas transparent to see the underlying content. N.B: This feature only works with **a single content**. default is false.
