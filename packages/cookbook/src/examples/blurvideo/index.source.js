module.exports=`//@flow
import React, { Component } from "react";
import { Bus } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurV } from "../blurmap";
import { Saturate } from "../saturation";
import { Video, videoMP4 } from "../video";
import StaticBlurMap from "../../toolbox/StaticBlurMap";

// We must use a <Bus> if we don't want the <video> element to be duplicated
// per Blur pass.. Also since we can dynamically change the number of passes,
// it changes the tree level, (e.g. Blur1D>Blur1D>video becomes Blur1D>video)
// and React always destroys and recreates the instance during reconciliation.

export default class Example extends Component {
  render() {
    const {
      factor,
      passes,
      contrast,
      saturation,
      brightness,
      map,
    } = this.props;
    return (
      <Surface width={480} height={360} pixelRatio={1}>
        <Bus ref="vid">
          <Saturate
            contrast={contrast}
            saturation={saturation}
            brightness={brightness}
          >
            {(redraw) => (
              <Video onFrame={redraw} autoPlay loop>
                <source type="video/mp4" src={videoMP4} />
              </Video>
            )}
          </Saturate>
        </Bus>
        <BlurV map={map} passes={passes} factor={factor}>
          {
            // as a texture, we give a function that resolve the video ref
            () => this.refs.vid
          }
        </BlurV>
      </Surface>
    );
  }

  static defaultProps = {
    contrast: 1,
    saturation: 1,
    brightness: 1,
    factor: 2,
    passes: 4,
    map: StaticBlurMap.images[0],
  };
}
`
