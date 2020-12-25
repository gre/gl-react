//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, Bus, LinearCopy } from "gl-react";
import { Surface, askCameraPermission } from "../../gl-react-implementation";
import { GLCamera } from "./GLCamera";
import { Colorify } from "../colorscale";
import colorScales from "../colorscale/colorScales";
import timeLoop from "../../HOC/timeLoop";

export default class Example extends Component {
  camera: *;
  state = { permission: null };
  async componentDidMount() {
    if (askCameraPermission) {
      const permission = await askCameraPermission();
      this.setState({ permission });
    }
  }
  render() {
    const { interpolation, color, width, type } = this.props;
    const { permission } = this.state;
    if (!permission || permission.status !== "granted") return null;
    return (
      <Surface style={{ width, height: (width * 300) / 400 }}>
        <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
          <GLCamera position={type} />
        </Colorify>
      </Surface>
    );
  }
  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0],
  };
}
