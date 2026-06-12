# gl-react-blur

Universal [gl-react](https://github.com/gre/gl-react) multi-pass gaussian Blur effect with configurable intensity, also supporting variable blur with a map.

```jsx
import { Surface } from "gl-react-dom"; // or gl-react-expo / gl-react-native / gl-react-headless
import { Blur } from "gl-react-blur";

<Surface width={400} height={300}>
  <Blur factor={4} passes={4}>
    {"https://i.imgur.com/iPKTONG.jpg"}
  </Blur>
</Surface>;
```

## Components

- **`<Blur factor passes? directionForPass?>`** — multi-pass gaussian blur. `factor` is the blur intensity in pixels; `passes` (default 2) trades performance for quality; `directionForPass(pass, factor, total)` can customize the direction vector of each pass (defaults to cycling horizontal, vertical and the two diagonals with increasing radius).
- **`<BlurV map ...>`** — same as `Blur` but the blur intensity varies per-pixel, scaled by the red/green channels of the `map` texture (e.g. for tilt-shift or depth-of-field effects).
- **`<Blur1D direction>`** / **`<BlurV1D direction map>`** — a single blur pass in one direction, the building blocks of the above.

The content to blur is given as `children` and can be any gl-react texture input (image URL, video, canvas, another Node, ...). All components accept optional `width`/`height` and otherwise inherit the size from their parent (via `connectSize`).
