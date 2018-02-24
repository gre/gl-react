//@flow
import React, { Component } from "react";
import { Surface } from "../../gl-react-implementation";
import { DiamondCrop } from "../diamondcrop";
import { HelloBlue } from "../helloblue";

export default class Example extends Component {
  render() {
    const { width } = this.props;
    return (
      <Surface style={{ width, height: width }}>
        <DiamondCrop>
          <HelloBlue blue={0.8} />
        </DiamondCrop>
      </Surface>
    );
  }
}
