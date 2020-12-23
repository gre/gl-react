//@flow
import React, { Component } from "react";
import { View } from "react-native";
import { GLView as EXGLView } from "expo-gl";

export default class GLViewNative extends Component<{
  onContextCreate: (gl: WebGLRenderingContext) => void,
  style?: any,
  children?: any,
}> {
  afterDraw(gl: WebGLRenderingContext) {
    gl.flush();
    // $FlowFixMe
    gl.endFrameEXP();
  }

  ref: ?EXGLView;
  onRef = (ref: ?EXGLView) => {
    this.ref = ref;
  };

  onContextCreate = (gl: WebGLRenderingContext) => {
    const { getExtension } = gl;
    // monkey patch to get a way to access the EXGLView
    // $FlowFixMe
    gl.getExtension = (name) => {
      if (name === "GLViewRef") return this.ref;
      return getExtension.call(gl, name);
    };
    this.props.onContextCreate(gl);
  };

  capture = (
    opt: *
  ): Promise<{
    uri: string,
    localUri: string,
    width: number,
    height: number,
  }> => {
    const { ref } = this;
    if (!ref) return Promise.reject(new Error("glView is unmounted"));
    return ref.takeSnapshotAsync(opt);
  };

  render() {
    const { style, onContextCreate, children, ...rest } = this.props;
    if (__DEV__) {
      if ("width" in rest || "height" in rest) {
        console.warn(
          "gl-react-expo <Surface>: no such width/height prop. instead you must use the style prop like for a <View>."
        );
      }
    }
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
          onContextCreate={this.onContextCreate}
          ref={this.onRef}
        />
        <View style={{ opacity: 0 }}>{children}</View>
      </View>
    );
  }
}
