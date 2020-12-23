// @flow
import React, { Component, useEffect } from "react";
import { Surface } from "gl-react-dom";
import { Video, VideoContext } from "../video";
import { Colorify, colorScales } from "../colorscale";

// We can give our [<Video>](/blurvideo) component a <WebCamSource> to have webcam stream!
const WebCamSourceR = ({ videoRef }) => {
  useEffect(() => {
    navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
  }, [videoRef]);
  return null;
};

export const WebCamSource = () => (
  <VideoContext.Consumer>
    {(videoRef) => <WebCamSourceR videoRef={videoRef} />}
  </VideoContext.Consumer>
);

export default class Example extends Component {
  render() {
    const { interpolation, color } = this.props;
    return (
      <Surface width={480} height={360}>
        <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
          {(redraw) => (
            <Video onFrame={redraw} autoPlay>
              <WebCamSource />
            </Video>
          )}
        </Colorify>
      </Surface>
    );
  }

  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0],
  };
}
