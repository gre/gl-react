//@flow
import React, { Component } from "react";
import Node from "./Node";
import copyShader from "./copyShader";

type Props = {
  children?: any,
};

/**
 * copy pixel with a linear interpolation
 * @prop {any} children content to render
 */
class LinearCopy extends Component<Props> {
  _node: ?Node;
  /**
   * get a reference to the underlying Node instance
   * @return {Node}
   */
  getNodeRef() {
    return this._node;
  }
  _onRef = (node: ?Node) => {
    this._node = node;
  };
  render() {
    const { children: t, ...rest } = this.props;
    return (
      <Node
        {...rest}
        ref={this._onRef}
        shader={copyShader}
        blendFunc={{ src: "one", dst: "one minus src alpha" }}
        uniformsOptions={{ t: { interpolation: "linear" } }}
        uniforms={{ t }}
      />
    );
  }
}

export default LinearCopy;
