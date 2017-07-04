//@flow
import React, { Component } from "react";
import Node from "./Node";
import copyShader from "./copyShader";

type Props = {|
  children?: any
|};

/**
 * copy pixel with no interpolation (nearest pixel)
 * @prop {any} children content to render
 */
class NearestCopy extends Component {
  props: Props;
  render() {
    const { children: t } = this.props;
    return (
      <Node
        shader={copyShader}
        blendFunc={{ src: "one", dst: "one minus src alpha" }}
        uniformsOptions={{ t: { interpolation: "nearest" } }}
        uniforms={{ t }}
      />
    );
  }
}

export default NearestCopy;
