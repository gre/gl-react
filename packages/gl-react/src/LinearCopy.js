//@flow
import React, { Component } from "react";
import Node from "./Node";
import copyShader from "./copyShader";

type Props = {|
  children?: any,
|};

/**
 * copy pixel with a linear interpolation
 * @prop {any} children content to render
 */
class LinearCopy extends Component {
  props: Props;
  render() {
    const { children: t } = this.props;
    return (
      <Node
        shader={copyShader}
        blendFunc={{ src: "one", dst: "one minus src alpha" }}
        uniforms={{ t }}
      />
    );
  }
}

export default LinearCopy;
