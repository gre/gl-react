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
it tells the `gl-react-core` algorithm to "unfold" the `render()` looking for a `GL.View` to merge with.

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
      <GL.Target uniform="tex">{children}</GL.Target>
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

## Implementation notes

Effects composition are made efficient using OpenGL Framebuffers:
the rendering is made in the same pipeline.

[`gl-react-core`](https://github.com/ProjectSeptemberInc/gl-react-core)
contains the core logic (shared across both `gl-react` and `gl-react-native`)
that convert the Virtual DOM Tree into `data`, an object tree that represent the rendering pipeline.

Respective implementation will then uses that `data` tree and
render it in OpenGL (for gl-react-native) or in WebGL (for gl-react, using [stack.gl](http://stack.gl) libs).
