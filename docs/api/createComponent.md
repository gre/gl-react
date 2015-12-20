# createComponent

**`GL.createComponent` is a function used to create a GL Component.**

A **"GL Component"** a React Component that always either renders a `GL.Node` or another **GL Component**.

`GL.createComponent(props => glView)` takes a render function *(takes props object in parameter and returns a GL.Node or GL Component)* and returns a GL Component.

```js
const MyEffect = GL.createComponent(
  (props) => <GL.Node .../>
);
```

`GL.createComponent` enable effects **composition**:
The fact that a component is a **GL component** technically tells the `gl-react` algorithm to "unfold" the `render()` looking for a `GL.Node` to merge with. If your component is not a `GL Component`, it will be treated as a content to rasterized and the effect composition won't work.

## staticFields

```js
GL.createComponent(props => glView, staticFields)
```

To facilitate the usage of `GL.createComponent` there is also an optional second parameter which is the React Component static fields.
We recommend you to always provide displayName for gl-react debug purpose.

```
module.exports = GL.createComponent(renderGLViewFunction, { displayName: "MyEffect" });
```

## `context` second parameter

the render function also takes a second parameter, context, an object that contains contextual information.

```js
const MyEffect = GL.createComponent(
  (props, context) => <GL.Node .../>
);
```

context contains following fields:

- `parentWidth` **(number)**: the width defined by the parent (can come from GL.Node, GLComponent or GL Surface).
- `parentHeight` **(number)**: the height defined by the parent.
- `pixelRatio` **(number)**: the pixel ratio (or scale) used by the Surface.


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
  ({ children, someParam }) =>
  <GL.Node shader={shaders.myEffect} uniforms={{ someParam }}>
    <GL.Uniform name="tex">{children}</GL.Uniform>
  </GL.Node>
);
```

Once you have defined effect components that inject `children` (let's say `Blur` and `Negative`), you can compose them together.

**Example:**

```html
<Blur factor={1.2} width={200} height={150}>
  <Negative>
    http://i.imgur.com/qM9BHCy.jpg
  </Negative>
</Blur>
```

and define another generic component out of it:

```js
const BlurNegative = GL.createComponent(
  ({ width, height, blur, children }) =>
    <Blur factor={blur} width={width} height={height}>
      <Negative>
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
  ({ children: tex, someParam }) =>
    <GL.Node
      shader={shaders.myEffect}
      uniforms={{ someParam, tex }}
    />
);
```

> `{ tex }` can be anything: an image URL, another stack of effects, a content (like a View, a Text,...).
**That way you don't have to worry about your component capabilities.**

## Implementation notes

Effects composition are made efficient using OpenGL Framebuffers:
the rendering is made in the same pipeline.

[`gl-react`](https://github.com/ProjectSeptemberInc/gl-react)
contains the core logic (shared across both `gl-react-dom` and `gl-react-native`)
that convert the Virtual DOM Tree into `data`, an object tree that represent the rendering pipeline.

Respective implementation will then uses that `data` tree and
render it in OpenGL (for gl-react-native) or in WebGL (for gl-react-dom, using [stack.gl](http://stack.gl) libs).
