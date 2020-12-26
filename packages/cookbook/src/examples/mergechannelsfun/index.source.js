module.exports=`//@flow
import React from "react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import { MergeChannels } from "../mergechannels";
import { Video, videoMP4 } from "../video";
import { RotatingGameOfLifeLoop } from "../golrotscu";

export default () => (
  <Surface width={400} height={400}>
    <MergeChannels
      green={<RotatingGameOfLifeLoop size={32} />}
      blue={(redraw) => (
        <Video onFrame={redraw} autoPlay loop>
          <source type="video/mp4" src={videoMP4} />
        </Video>
      )}
      red={
        <JSON2D width={400} height={400}>
          {{
            background: "#000",
            size: [400, 400],
            draws: [
              {
                textAlign: "center",
                fillStyle: "#fff",
                font: "48px bold Arial",
              },
              [
                "fillText",
                "Hello World\\n2d canvas text\\ninjected as texture",
                200,
                160,
                60,
              ],
            ],
          }}
        </JSON2D>
      }
    />
  </Surface>
);
`
