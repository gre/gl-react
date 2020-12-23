module.exports = `//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { Colorify, colorScales } from "../colorscale";

// We can give our [<Video>](/blurvideo) component a <WebCamSource> to have webcam stream!
export class WebCamSource extends Component {
  state = { src: null };
  componentWillMount() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream =>
      this.setState({ src: URL.createObjectURL(stream) }));
  }
  render() {
    const {src} = this.state;
    return src ? <source src={src} /> : null;
  }
}

export default class Example extends Component {
  render() {
    const { interpolation, color } = this.props;
    return (
    <Surface width={480} height={360}>
      <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
        {redraw =>
          <Video onFrame={redraw} autoPlay>
            <WebCamSource />
          </Video> }
      </Colorify>
    </Surface>
    );
  }

  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0],
  };
}
`;
