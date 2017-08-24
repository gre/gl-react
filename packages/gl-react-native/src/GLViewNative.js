//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { WebGLView } from "react-native-webgl";

const propTypes = {
  onContextCreate: PropTypes.func.isRequired,
  onContextFailure: PropTypes.func.isRequired,
  style: PropTypes.any
};

export default class GLViewNative extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext) => void,
    onContextFailure: (e: Error) => void,
    style?: any,
    children?: any
  };
  static propTypes = propTypes;

  afterDraw(gl: WebGLRenderingContext) {
    const rngl = gl.getExtension("RN");
    gl.flush();
    rngl.endFrame();
  }

  render() {
    const {
      style,
      onContextCreate,
      onContextFailure,
      children,
      ...rest
    } = this.props;
    if (__DEV__) {
      if ("width" in rest || "height" in rest) {
        console.warn(
          "gl-react-native <Surface>: no such width/height prop. instead you must use the style prop like for a <View>."
        );
      }
    }
    return (
      <View
        {...rest}
        style={[{ position: "relative", overflow: "hidden" }, style]}
      >
        <WebGLView
          style={[
            style,
            {
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0
            }
          ]}
          onContextCreate={onContextCreate}
          onContextFailure={onContextFailure}
        />
        <View style={{ opacity: 0 }}>
          {children}
        </View>
      </View>
    );
  }
}
