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

> Technically, this is not required to extend `GL.Component` (you can still use `React.Component`),
but this is generally a good idea (you always want to make a component "composable").

## Composing effects

Once you have defined your component that inject children, you can then compose it with another.

**Example:**

```html
<Blur factor={1.2} width={200} height={150}>
  <Negative width={200} height={150}>
    http://i.imgur.com/qM9BHCy.jpg
  </Negative>
</Blur>
```

and you can make generic component out of it:

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
