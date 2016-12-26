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
  const {
    texSubImage2D,
    bindFramebuffer,
    bindRenderbuffer,
    bindTexture,
    getParameter,
  } = gl;
  gl.enableLogging = true;
  gl.texSubImage2D = function (...args) {
    if (args.length === 9 && args[2] === 0 && args[3] === 0) {
      const [target, level, , , width, height, format, type, pixels] = args;
      gl.texImage2D(target, level, format, width, height, 0, format, type, pixels);
    } else {
      texSubImage2D.apply(gl, args);
    }
  };
  gl.createRenderbuffer = () => null;
  gl.framebufferRenderbuffer =
  gl.renderbufferStorage =
    () => {};
  let currentFboBinding = null;
  gl.bindFramebuffer = (target, fbo) => {
    currentFboBinding = fbo;
    bindFramebuffer.call(gl, target, fbo);
  };
  let currentRenderbufferBinding = null;
  gl.bindRenderbuffer = (target, renderbuffer) => {
    currentRenderbufferBinding = renderbuffer;
    try {
      bindRenderbuffer.call(gl, target, renderbuffer);
    }
    catch (e) { // FIXME current not impl by Exponent
      console.warn(e);
    }
  };
  let currentTextureBinding = null;
  gl.bindTexture = (target, texture) => {
    currentTextureBinding = texture;
    bindTexture.call(gl, target, texture);
  };
  gl.getParameter = (pname) => {
    if (pname === gl.FRAMEBUFFER_BINDING) {
      return currentFboBinding;
    }
    if (pname === gl.RENDERBUFFER_BINDING) {
      return currentRenderbufferBinding;
    }
    if (pname === gl.TEXTURE_BINDING_2D) {
      return currentTextureBinding;
    }
    return getParameter.call(gl, pname);
  };
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
