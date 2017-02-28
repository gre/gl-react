"use strict";

import React, { PropTypes } from "react";
import { View, Platform, requireNativeComponent } from "react-native";


// A component that acts as an OpenGL render target.

export default class GLView extends React.Component {
  static propTypes = {
    // Called when the OpenGL context is created, with the context object as a
    // parameter. The context object has an API mirroring WebGL"s
    // WebGLRenderingContext.
    onContextCreate: PropTypes.func,

    // [iOS only] Number of samples for Apple"s built-in multisampling.
    msaaSamples: PropTypes.number,

    ...View.propTypes,
  }

  static defaultProps = {
    msaaSamples: 4,
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { onContextCreate, msaaSamples, ...viewProps } = this.props;

    // NOTE: Removing `backgroundColor: "transparent"` causes a performance
    //       regression. Not sure why yet...
    return (
      <View {...viewProps}>
        <GLView.NativeView
          style={{ flex: 1, backgroundColor: "transparent" }}
          onSurfaceCreate={this._onSurfaceCreate}
          msaaSamples={Platform.OS === "ios" ? msaaSamples : undefined}
        />
      </View>
    );
  }

  _onSurfaceCreate = ({ nativeEvent: { exglCtxId } }) => {
    const gl = getGl(exglCtxId);
    if (this.props.onContextCreate) {
      this.props.onContextCreate(gl);
    }
  }

  static NativeView = requireNativeComponent("EXGLView", GLView, {
    nativeOnly: { onSurfaceCreate: true },
  });
}


// JavaScript WebGL types to wrap around native objects
class WebGLRenderingContext {}
class WebGLObject {
  constructor (id) {
    this.id = id; // Native GL object id
  }
  toString() {
    return `[WebGLObject ${this.id}]`;
  }
}
class WebGLBuffer extends WebGLObject {}
class WebGLFramebuffer extends WebGLObject {}
class WebGLProgram extends WebGLObject {}
class WebGLRenderbuffer extends WebGLObject {}
class WebGLShader extends WebGLObject {}
class WebGLTexture extends WebGLObject {}

global.WebGLRenderingContext = WebGLRenderingContext;
global.WebGLObject = WebGLObject;
global.WebGLBuffer = WebGLBuffer;
global.WebGLFramebuffer = WebGLFramebuffer;
global.WebGLProgram = WebGLProgram;
global.WebGLRenderbuffer = WebGLRenderbuffer;
global.WebGLShader = WebGLShader;
global.WebGLTexture = WebGLTexture;

const idToObject = {};
const wrapObject = (type, id) => {
  const found = idToObject[id];
  if (found) {
    return found;
  }
  return idToObject[id] = new type(id);
};

class WebGLUniformLocation {
  constructor (id) {
    this.id = id; // Native GL object id
  }
}
global.WebGLUniformLocation = WebGLUniformLocation;

class WebGLActiveInfo {
  constructor (obj) {
    Object.assign(this, obj);
  }
}
global.WebGLActiveInfo = WebGLActiveInfo;
class WebGLShaderPrecisionFormat {
  constructor (obj) {
    Object.assign(this, obj);
  }
}
global.WebGLShaderPrecisionFormat = WebGLShaderPrecisionFormat;

// Many functions need wrapping/unwrapping of arguments and return value. We
// handle each case specifically so we can write the tightest code for
// better performance.
const wrapMethods = (gl) => {
  const wrap = (methodNames, wrapper) =>
    (Array.isArray(methodNames) ? methodNames : [methodNames]).forEach(
      (methodName) => gl[methodName] = wrapper(gl[methodName]));

  // We can be slow in `gl.getParameter(...)` since it"s a blocking call anyways
  const getParameterTypes = {
    [gl.ARRAY_BUFFER_BINDING]: WebGLBuffer,
    [gl.ELEMENT_ARRAY_BUFFER_BINDING]: WebGLBuffer,
    [gl.CURRENT_PROGRAM]: WebGLProgram,
    [gl.FRAMEBUFFER_BINDING]: WebGLFramebuffer,
    [gl.RENDERBUFFER_BINDING]: WebGLRenderbuffer,
    [gl.TEXTURE_BINDING_2D]: WebGLTexture,
    [gl.TEXTURE_BINDING_CUBE_MAP]: WebGLTexture,
  };
  wrap("getParameter", (orig) => (pname) => {
    const ret = orig.call(gl, pname);
    const type = getParameterTypes[pname];
    return type ? wrapObject(type, ret) : ret;
  });

  // Buffers
  wrap("bindBuffer", (orig) => (target, buffer) =>
    orig.call(gl, target, buffer && buffer.id));
  wrap("createBuffer", (orig) => () =>
    wrapObject(WebGLBuffer, orig.call(gl)));
  wrap("deleteBuffer", (orig) => (buffer) =>
    orig.call(gl, buffer && buffer.id));
  wrap("isBuffer", (orig) => (buffer) =>
    buffer instanceof WebGLBuffer && orig.call(gl, buffer.id));

  // Framebuffers
  wrap("bindFramebuffer", (orig) => (target, framebuffer) =>
    orig.call(gl, target, framebuffer && framebuffer.id));
  wrap("createFramebuffer", (orig) => () =>
    wrapObject(WebGLFramebuffer, orig.call(gl)));
  wrap("deleteFramebuffer", (orig) => (framebuffer) =>
    orig.call(gl, framebuffer && framebuffer.id));
  wrap("framebufferRenderbuffer", (orig) => (target, attachment, rbtarget, rb) =>
    orig.call(gl, target, attachment, rbtarget, rb && rb.id));
  wrap("framebufferTexture2D", (orig) => (target, attachment, textarget, tex, level) =>
    orig.call(gl, target, attachment, textarget, tex && tex.id, level));
  wrap("isFramebuffer", (orig) => (framebuffer) =>
    framebuffer instanceof WebGLFramebuffer && orig.call(gl, framebuffer.id));

  // Renderbuffers
  wrap("bindRenderbuffer", (orig) => (target, renderbuffer) =>
    orig.call(gl, target, renderbuffer && renderbuffer.id));
  wrap("createRenderbuffer", (orig) => () =>
    wrapObject(WebGLRenderbuffer, orig.call(gl)));
  wrap("deleteRenderbuffer", (orig) => (renderbuffer) =>
    orig.call(gl, renderbuffer && renderbuffer.id));
  wrap("isRenderbuffer", (orig) => (renderbuffer) =>
    renderbuffer instanceof WebGLRenderbuffer && orig.call(gl, renderbuffer.id));

  // Textures
  wrap("bindTexture", (orig) => (target, texture) =>
    orig.call(gl, target, texture && texture.id));
  wrap("createTexture", (orig) => () =>
    wrapObject(WebGLTexture, orig.call(gl)));
  wrap("deleteTexture", (orig) => (texture) =>
    orig.call(gl, texture && texture.id));
  wrap("isTexture", (orig) => (texture) =>
    texture instanceof WebGLTexture && orig.call(gl, texture.id));

  // Programs and shaders
  wrap("attachShader", (orig) => (program, shader) =>
    orig.call(gl, program && program.id, shader && shader.id));
  wrap("bindAttribLocation", (orig) => (program, index, name) =>
    orig.call(gl, program && program.id, index, name));
  wrap("compileShader", (orig) => (shader) =>
    orig.call(gl, shader && shader.id));
  wrap("createProgram", (orig) => () =>
    wrapObject(WebGLProgram, orig.call(gl)));
  wrap("createShader", (orig) => (type) =>
    wrapObject(WebGLShader, orig.call(gl, type)));
  wrap("deleteProgram", (orig) => (program) =>
    orig.call(gl, program && program.id));
  wrap("deleteShader", (orig) => (shader) =>
    orig.call(gl, shader && shader.id));
  wrap("detachShader", (orig) => (program, shader) =>
    orig.call(gl, program && program.id, shader && shader.id));
  wrap("getAttachedShaders", (orig) => (program) =>
    orig.call(gl, program && program.id).map((id) => wrapObject(WebGLShader, id)));
  wrap("getProgramParameter", (orig) => (program, pname) =>
    orig.call(gl, program && program.id, pname));
  wrap("getProgramInfoLog", (orig) => (program) =>
    orig.call(gl, program && program.id));
  wrap("getShaderParameter", (orig) => (shader, pname) =>
    orig.call(gl, shader && shader.id, pname));
  wrap("getShaderPrecisionFormat", (orig) => (shadertype, precisiontype) =>
    new WebGLShaderPrecisionFormat(orig.call(gl, shadertype, precisiontype)));
  wrap("getShaderInfoLog", (orig) => (shader) =>
    orig.call(gl, shader && shader.id));
  wrap("getShaderSource", (orig) => (shader) =>
    orig.call(gl, shader && shader.id));
  wrap("linkProgram", (orig) => (program) =>
    orig.call(gl, program && program.id));
  wrap("shaderSource", (orig) => (shader, source) =>
    orig.call(gl, shader && shader.id, source));
  wrap("useProgram", (orig) => (program) =>
    orig.call(gl, program && program.id));
  wrap("validateProgram", (orig) => (program) =>
    orig.call(gl, program && program.id));
  wrap("isShader", (orig) => (shader) =>
    shader instanceof WebGLShader && orig.call(gl, shader.id));
  wrap("isProgram", (orig) => (program) =>
    program instanceof WebGLProgram && orig.call(gl, program.id));

  // Uniforms and attributes
  wrap("getActiveAttrib", (orig) => (program, index) =>
    new WebGLActiveInfo(orig.call(gl, program && program.id, index)));
  wrap("getActiveUniform", (orig) => (program, index) =>
    new WebGLActiveInfo(orig.call(gl, program && program.id, index)));
  wrap("getAttribLocation", (orig) => (program, name) =>
    orig.call(gl, program && program.id, name));
  wrap("getUniform", (orig) => (program, location) =>
    orig.call(gl, program && program.id, location && location.id));
  wrap("getUniformLocation", (orig) => (program, name) =>
    new WebGLUniformLocation(orig.call(gl, program && program.id, name)));
  wrap(["uniform1f", "uniform1i"], (orig) => (loc, x) =>
    orig.call(gl, loc && loc.id, x));
  wrap(["uniform2f", "uniform2i"], (orig) => (loc, x, y) =>
    orig.call(gl, loc && loc.id, x, y));
  wrap(["uniform3f", "uniform3i"], (orig) => (loc, x, y, z) =>
    orig.call(gl, loc && loc.id, x, y, z));
  wrap(["uniform4f", "uniform4i"], (orig) => (loc, x, y, z, w) =>
    orig.call(gl, loc && loc.id, x, y, z, w));
  wrap(["uniform1fv", "uniform2fv", "uniform3fv", "uniform4fv"],
        (orig) => (loc, val) => orig.call(gl, loc && loc.id, new Float32Array(val)));
  wrap(["uniform1iv", "uniform2iv", "uniform3iv", "uniform4iv"],
        (orig) => (loc, val) => orig.call(gl, loc && loc.id, new Int32Array(val)));
  wrap(["uniformMatrix2fv", "uniformMatrix3fv", "uniformMatrix4fv"],
        (orig) => (loc, transpose, val) =>
          orig.call(gl, loc && loc.id, transpose, new Float32Array(val)));
  wrap(["vertexAttrib1fv", "vertexAttrib2fv", "vertexAttrib3fv", "vertexAttrib4fv"],
        (orig) => (index, val) => orig.call(gl, index, new Float32Array(val)));
};

// Get the GL interface from an EXGLContextID and do JS-side setup
const getGl = (exglCtxId) => {
  if (!global.__EXGLContexts) {
    console.warn(
      "gl-react-native will renders black if it runs outside JavaScriptCore. "+
      "For instance, it won't work with Chrome JS Debugging."
    );
    return null;
  }
  const gl = global.__EXGLContexts[exglCtxId];
  delete global.__EXGLContexts[exglCtxId];
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(gl, global.WebGLRenderingContext.prototype);
  } else {
    gl.__proto__ = global.WebGLRenderingContext.prototype;
  }
  wrapMethods(gl);
  gl.canvas = null;
  const viewport = gl.getParameter(gl.VIEWPORT);
  gl.drawingBufferWidth = viewport[2];
  gl.drawingBufferHeight = viewport[3];
  return gl;
};
