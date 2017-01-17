//@flow
import React, {Component, PropTypes} from "react";
import {View} from "react-native";
import { GLView }  from "exponent";

const propTypes = {
  onContextCreate: PropTypes.func.isRequired,
  style: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

const tmpPatch = cb => gl => {
  gl.enableLogging = true; // our impl is still WIP so keeping that flag on for now.

  // FIXME these needs to be implemented by EXGL
  gl.isShader = shader => shader instanceof global.WebGLShader;

  return cb(gl);
};

export default class GLViewNative extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext) => void,
    style: any,
    width: number,
    height: number,
    children?: any,
  };
  static propTypes = propTypes;

  afterDraw (gl: WebGLRenderingContext) {
    gl.flush();
    // $FlowFixMe
    gl.endFrameEXP();
  }

  render() {
    const { style, onContextCreate, children, ...rest } = this.props;
    return <View {...rest} style={[ style, { position: "relative", overflow: "hidden" } ]}>
      <GLView
        style={[style, {
          flex: 1,
          position: "absolute",
          top: 0,
          left: 0
        }]}
        onContextCreate={tmpPatch(onContextCreate)}
      />
      <View style={{ opacity: 0 }}>
        {children}
      </View>
    </View>;
  }
}
