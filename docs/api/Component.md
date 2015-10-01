# Component

**`GL.Component` is the class to extend to implement a GL Component.**

```js
class MyEffect extends GL.Component {
  render () {
    return <GL.View ...>...</GL.View>;
  }
}
```

`GL.Component` allows to **compose** effects:
it tells the `gl-react-core` algorithm to "unfold" the `render()` looking for a `GL.View` to merge with. If your component is not a `GL.Component`, it will be treated as a content to rasterized and the effect composition won't work.

> Although it is technically not required to extend `GL.Component` (you can still use `React.Component`),
this is generally a good idea because you always want to make a component "composable".

## Composing effects

Effects component can be implemented as follow:

```js
const shaders = GL.Shaders.create({
  myEffect: {
    frag: `
precision highp float;
varying vec2 uv;
uniform sampler2D tex;
uniform float someParam;

void main() {
  vec4 textureColor = texture(tex, uv);
  vec4 c = ... // do something with textureColor and someParam
  gl_FragColor = c;
}
    `
  }
});
class MyEffect extends GL.Component {
  render () {
    const { width, height, children, someParam } = this.props;
    return <GL.View shader={shaders.myEffect} width={width} height={height} uniforms={{ someParam }}>
      <GL.Uniform name="tex">{children}</GL.Uniform>
    </GL.View>;
  }
}
```

Once you have defined effect components that inject `children` (let's say `Blur` and `Negative`), you can compose them together.

**Example:**

```html
<Blur factor={1.2} width={200} height={150}>
  <Negative width={200} height={150}>
    http://i.imgur.com/qM9BHCy.jpg
  </Negative>
</Blur>
```

and define another generic component out of it:

```js
class BlurNegative extends GL.Component {
  render () {
    const { width, height, blur, children } = this.props;
    return <Blur factor={blur} width={width} height={height}>
      <Negative width={width} height={height}>
        {children}
      </Negative>
    </Blur>;
  }
}
```

and use it:

```html
<BlurNegative factor={1.2} width={200} height={150}>
  http://i.imgur.com/qM9BHCy.jpg
</BlurNegative>
```

## More generic implementation

Here is a more recommended way to make your effects components even more generic and reusable (also more concise in code):


```js
class MyEffect extends GL.Component {
  render () {
    const { children: tex, someParam, ...rest } = this.props;
    return <GL.View
      {...rest}
      shader={shaders.myEffect}
      uniforms={{ someParam, tex }}
    />;
  }
}
```

Notice that, whatever we give to `MyEffect`, it will be intercepted in `rest` and directly passed to the `GL.View`.
This delegation allows `MyEffect` to be generic by benefiting everything `GL.View` does, and allows to use the component in ways you have not initially thought of.

For instance, you might not need to pass `width` and `height` if you are in a sub-GL.View and you just want to use the same dimension:

```html
<MyOtherEffect width={w} height={h}>
  <MyEffect someParam={42}> // here, width and height will be inherited
    {content}
  </MyEffect>
</MyOtherEffect>
```

> By transferring unused props to `GL.View`, you allow your component to be used in any way.
Also remember that `{content}` can be anything: an image URL, another stack of effects, a content (like a View, a Text,...).
**That way you don't have to worry about your component capabilities.**

## Implementation notes

Effects composition are made efficient using OpenGL Framebuffers:
the rendering is made in the same pipeline.

[`gl-react-core`](https://github.com/ProjectSeptemberInc/gl-react-core)
contains the core logic (shared across both `gl-react` and `gl-react-native`)
that convert the Virtual DOM Tree into `data`, an object tree that represent the rendering pipeline.

Respective implementation will then uses that `data` tree and
render it in OpenGL (for gl-react-native) or in WebGL (for gl-react, using [stack.gl](http://stack.gl) libs).
