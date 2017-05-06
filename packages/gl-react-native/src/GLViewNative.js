//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import EXGLView from "./EXGLView";

const propTypes = {
  onContextCreate: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default class GLViewNative extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext) => void,
    style?: any,
    children?: any,
  };
  static propTypes = propTypes;

  afterDraw(gl: WebGLRenderingContext) {
    gl.flush();
    // $FlowFixMe
    gl.endFrameEXP();
  }

  render() {
    const { style, onContextCreate, children, ...rest } = this.props;
    return (
      <View
        {...rest}
        style={[{ position: "relative", overflow: "hidden" }, style]}
      >
        <EXGLView
          style={[
            style,
            {
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
            },
          ]}
          onContextCreate={onContextCreate}
        />
        <View style={{ opacity: 0 }}>
          {children}
        </View>
      </View>
    );
  }
}
