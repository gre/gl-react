//@flow
import React, {Component} from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import getContext from "./getContext";
import loseGL from "./loseGL";

/**
 * WebGL context initial options.
 */
type WebGLContextAttributes = {
  alpha?: boolean,
  depth?: boolean,
  stencil?: boolean,
  antialias?: boolean,
  premultipliedAlpha?: boolean,
  preserveDrawingBuffer?: boolean,
  preferLowPowerToHighPerformance?: boolean,
  failIfMajorPerformanceCaveat?: boolean,
};

const propTypes = {
  onContextCreate: PropTypes.func.isRequired,
  onContextFailure: PropTypes.func.isRequired,
  onContextLost: PropTypes.func.isRequired,
  onContextRestored: PropTypes.func.isRequired,
  webglContextAttributes: PropTypes.object,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
  pixelRatio: PropTypes.number,
};

export default class GLViewDOM extends Component {
  props: {
    onContextCreate: (gl: WebGLRenderingContext)=>void,
    onContextFailure: (e: Error)=>void,
    onContextLost: ()=>void,
    onContextRestored: (gl: ?WebGLRenderingContext)=>void,
    webglContextAttributes?: WebGLContextAttributes,
    pixelRatio?: number,
    width: number,
    height: number,
    style?: any,
    debug?: number,
  };
  static propTypes = propTypes;
  webglContextAttributes: WebGLContextAttributes;
  canvas: ?HTMLCanvasElement;
  gl: ?WebGLRenderingContext;

  componentDidMount() {
    const { onContextCreate, onContextFailure } = this.props;
    const gl: ?WebGLRenderingContext = this._createContext();
    if (gl) {
      this.gl = gl;
      onContextCreate(gl);
      const {canvas} = this;
      invariant(canvas, "canvas is not settled in GLViewDOM#componentDidMount");
      canvas.addEventListener("webglcontextlost", this._onContextLost);
      canvas.addEventListener("webglcontextrestored", this._onContextRestored);
    }
    else {
      onContextFailure(new Error("no-webgl-context"));
    }
  }

  componentWillUnmount() {
    if (this.gl) {
      loseGL(this.gl);
      this.gl = null;
    }
    const {canvas} = this;
    if (canvas) {
      canvas.removeEventListener("webglcontextlost", this._onContextLost);
      canvas.removeEventListener("webglcontextrestored", this._onContextRestored);
    }
  }

  render() {
    let {
      width,
      height,
      pixelRatio,
      style,
      debug, // eslint-disable-line no-unused-vars
      ...rest
    } = this.props;
    if (!pixelRatio) pixelRatio = Number(window.devicePixelRatio || 1);
    for (let k in propTypes) {
      if (rest.hasOwnProperty(k)) {
        delete rest[k];
      }
    }
    return <canvas
      ref={this.onRef}
      style={{ ...style, width, height }}
      width={width * pixelRatio}
      height={height * pixelRatio}
      {...rest}
    />;
  }

  _createContext() {
    const {webglContextAttributes, debug} = this.props;
    const gl: ?WebGLRenderingContext = getContext(
      this.canvas,
      debug
      ? { ...webglContextAttributes, preserveDrawingBuffer: true }
      : webglContextAttributes
    );
    this.webglContextAttributes = webglContextAttributes||{};
    return gl;
  }

  _onContextLost = (e: Event) => {
    e.preventDefault();
    this.gl = null;
    this.props.onContextLost();
  };

  _onContextRestored = () => {
    this.gl = this._createContext();
    this.props.onContextRestored(this.gl);
  };

  onRef = (ref: HTMLCanvasElement) => {
    this.canvas = ref;
  };

  captureAsDataURL(...args: any): string {
    if (!this.webglContextAttributes.preserveDrawingBuffer) {
      console.warn("Surface#captureAsDataURL is likely to not work if you don't define webglContextAttributes={{ preserveDrawingBuffer: true }}");
    }
    invariant(this.canvas, "canvas is no longer available");
    return this.canvas.toDataURL(...args);
  }

  captureAsBlob(...args: any): Promise<Blob> {
    if (!this.webglContextAttributes.preserveDrawingBuffer) {
      console.warn("Surface#captureAsBlob is likely to not work if you don't define webglContextAttributes={{ preserveDrawingBuffer: true }}");
    }
    return Promise.resolve().then(() => new Promise((resolve, reject) =>
      this.canvas
      ? this.canvas.toBlob(resolve, ...args)
      : reject(new Error("canvas is no longer available"))));
  }
}
