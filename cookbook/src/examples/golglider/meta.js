import React from "react";
import markdown from "../../markdown";
export const title = "GameOfLife is initialized with a glider texture";
import gliderGun64png from "./glider-gun-64.png";
export const desc = markdown`
**Game of Life** init with an image!
`;
export const descAfter = markdown`
Initial image state inspired from [wikipedia](https://en.wikipedia.org/wiki/Conway's_Game_of_Life).
${<br />}
${<a href={gliderGun64png}>
  <img
    alt=""
    style={{ width: 128, imageRendering: "pixelated" }}
    src={gliderGun64png}
  />
</a>}
`;
