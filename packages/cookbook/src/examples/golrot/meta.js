import markdown from "../../markdown";
export const title = "Rotating GameOfLife. 2 loops";
export const desc = markdown`
Compose [Game of Life][/gol] with Rotation

~~~
<RotatingLoop>
  <GameOfLifeLoop />
</RotatingLoop>
~~~
`;
export const descAfter = markdown`
GameOfLifeLoop runs at 5fps, RotatingLoop runs at full speed (60fps).

[next example](/golrotscu) will show how to do the same with a single update loop.

> NB: \`timeLoop\` creates a PureComponent which shortcut the React update.
`;
