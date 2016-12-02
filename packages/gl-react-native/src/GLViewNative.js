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

export default class GLViewNative extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext)=>void,
    style: any,
    width: number,
    height: number,
    children?: any,
  };
  static propTypes = propTypes;

  afterDraw (gl: WebGLRenderingContext) {
    gl.flush();
    gl.endFrameEXP();
  }

  render() {
    const { style, onContextCreate, children, ...rest } = this.props;
    return <View {...rest} style={[style, {position:"relative",overflow:"hidden"}]}>
      <GLView
        style={[style, {
          flex: 1,
          position: "absolute",
          top: 0,
          left: 0
        }]}
        onContextCreate={onContextCreate}
      />
      <View style={{opacity:0}}>
        {children}
      </View>
    </View>;
  }
}
