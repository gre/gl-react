//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { GLView } from "expo";

const propTypes = {
  onContextCreate: PropTypes.func.isRequired,
  style: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default class GLViewNative extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext) => void,
    style?: any,
    children?: any,
    width?: number,
    height?: number,
  };
  static propTypes = propTypes;

  afterDraw(gl: WebGLRenderingContext) {
    gl.flush();
    // $FlowFixMe
    gl.endFrameEXP();
  }

  render() {
    const {
      width,
      height,
      style,
      onContextCreate,
      children,
      ...rest
    } = this.props;
    return (
      <View
        {...rest}
        style={[
          { width, height },
          style,
          { position: "relative", overflow: "hidden" },
        ]}
      >
        <GLView
          style={[
            { width, height },
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
