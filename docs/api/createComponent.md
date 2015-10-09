# createComponent

> `GL.Component` used to be a class that you inherit like `React.Component`.
This was limited and verbose, also didn't allow some features to be implemented.
`GL.Component` is deprecated in favor of `GL.createComponent`.


**`GL.createComponent` is a function used to create a GL Component.**

We called **GL Component** a React Component that always either renders a `GL.View` or another **GL Component**.

`GL.createComponent(props => glView)` takes a render function *(takes props object in parameter and returns a GL.View or GL Component)*.

```js
const MyEffect = GL.createComponent(
  (props) => <GL.View .../>
);
```

`GL.createComponent` enable effects **composition**:
The fact that a component is a **GL component** tells the `gl-react-core` algorithm to "unfold" the `render()` looking for a `GL.View` to merge with. If your component is not a `GL Component`, it will be treated as a content to rasterized and the effect composition won't work.

> Although it is technically not required to use `GL.createComponent` to getting things done with `GL.View`,
this is generally a good idea because you always want to make our components "composable" (composable in term of GL stack).

## staticFields

```js
GL.createComponent(props=>glView, staticFields)
```

To facilitate the usage of `GL.createComponent` there is also an optional second parameter which is the React Component static fields.
We recommend you to always provide displayName for future debug purpose.

```
module.exports = GL.createComponent(renderGLViewFunction, { displayName: "MyEffect" });
```


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

const MyEffect = GL.createComponent(
  ({ width, height, children, someParam }) =>
  <GL.View shader={shaders.myEffect} width={width} height={height} uniforms={{ someParam }}>
    <GL.Uniform name="tex">{children}</GL.Uniform>
  </GL.View>
);
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
const BlurNegative = GL.createComponent(
  ({ width, height, blur, children }) =>
    <Blur factor={blur} width={width} height={height}>
      <Negative width={width} height={height}>
        {children}
      </Negative>
    </Blur>
);
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
const MyEffect = GL.createComponent(
  ({ children: tex, someParam, ...rest }) =>
    <GL.View
      {...rest}
      shader={shaders.myEffect}
      uniforms={{ someParam, tex }}
    />
);
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
