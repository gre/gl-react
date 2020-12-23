import React from "react";

export const title = "Behind Asteroids (js13k 2015 – greweb)";

export const toolbox = [
  {
    prop: "showCanvas",
    title: "Under the hood",
    Editor: ({ value, onChange }) => (
      <div>
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          Show the 2D Canvas rendered by the game
        </label>
        <p>
          <em>
            The rest of the rendering is done in WebGL (ported in gl-react).
          </em>
        </p>
      </div>
    ),
  },
];
