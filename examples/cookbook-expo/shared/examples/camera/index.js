//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, LinearCopy } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import { Colorify } from "../colorscale";
import colorScales from "../colorscale/colorScales";
import timeLoop from "../../HOC/timeLoop";

const CameraFrontStream = timeLoop(() => (
  <LinearCopy>
    {{
      camera: {
        position: "front"
      }
    }}
  </LinearCopy>
));

export default class Example extends Component {
  render() {
    const { interpolation, color, width } = this.props;
    return (
      <Surface style={{ width, height: width * 300 / 400 }}>
        <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
          <CameraFrontStream />
        </Colorify>
      </Surface>
    );
  }
  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0]
  };
}
