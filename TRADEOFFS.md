# gl-react tradeoffs

## "WebGL is a 2D API"

The library is focused on composing fragment shaders for use-cases like 2D effects on images/videos/...
**That means Vertex shader and Vertex data are currently out of scope, `gl-react` isn't for 3D use-cases yet**. We might provide soon a escape hatch to do arbitrary gl calls in a Node. Instead, directly use WebGL API (in web) or `react-native-webgl` (in React Native) with optional combination of a WebGL library like Three.js or PIXI.js.

## Framebuffers (FBOs)

The library uses **one framebuffer per `<Node>`** and do not re-use FBOs across Node instances.
This allows to implement Node caching (only redraw Node if necessary).

2 exceptions:

- The root `<Node>` do not uses any FBO because it directly draws on the `<Surface>` canvas.
- The use of `backbuffering` will make a `<Node>` uses 2 FBOs: the framebuffer and the backbuffer, each draw will make them swap.

## Surface and Node redraw

In order to make redraw efficient, `gl-react` have 2 phases: the `redraw()` phase and the `flush()` phase (reflecting the respective methods  available both on `Surface` and `Node`). In short:

- **redraw() phase** sets a dirty flag to a Node and all its "dependents" (other nodes, buses, surface). *redraws happen generally bottom-up to the Surface.*
- **flush() phase** draws all nodes that have the redraw flag. *draws happens top-down from the Surface.*

`redraw()` is directly hooked to React update lifecycle (re-rendering a Node will calls `redraw()` for you).
To make this system efficient, **the flush() is by default asynchronous**, i.e. `redraw()` means scheduling a new gl draw.
Surface have a main loop that runs at 60 fps and call `flush()`. This is very efficient because if Surface does not have the redraw flag,  `flush()` does nothing.

> If you want to make a `<Node>` synchronously flushing the drawing each time it renders, you can still use the `sync` prop (see in the example "`GameOfLife`").

## `<Bus>`, a way to share computation

[gl-react used to automatically factorize the duplicates elements of your tree](http://greweb.me/2016/06/glreactconf/), **it has been decided to remove this feature**
in order to make you fully in control.

The new gl-react embraces more the React paradigm. If you duplicate a Node or an Element at multiple places in your GL tree, you might use `<Bus>` to express a GL graph instead (and share computation) so it doesn't compute X times the same thing.

> This was actually a pain to implement the de-duplication feature, and it doesn't work great with React reconciliation. It was probably a premature optimization.
