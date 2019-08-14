//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import getContext from "./getContext";
import loseGL from "./loseGL";

const __DEV__ = process.env.NODE_ENV === "development";

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
  failIfMajorPerformanceCaveat?: boolean
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
  pixelRatio: PropTypes.number
};

class ErrorDebug extends Component {
  render() {
    const { error } = this.props;
    let title = String(error.rawError || error.message || error);
    let detail = String(error.longMessage || error.rawError || "");
    const style = {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      padding: "1em",
      background: "#a00",
      color: "#fff",
      fontSize: "12px",
      lineHeight: "1.2em",
      fontStyle: "normal",
      fontWeight: "normal",
      fontFamily: "monospace",
      overflow: "auto"
    };
    const titleStyle = {
      fontWeight: "bold",
      marginBottom: "1em"
    };
    const detailStyle = {
      whiteSpace: "pre"
    };
    return (
      <div style={style}>
        <div style={titleStyle}>{title}</div>
        <div style={detailStyle}>{detail}</div>
      </div>
    );
  }
}

export default class GLViewDOM extends Component<
  {
    onContextCreate: (gl: WebGLRenderingContext) => void,
    onContextFailure: (e: Error) => void,
    onContextLost: () => void,
    onContextRestored: (gl: ?WebGLRenderingContext) => void,
    webglContextAttributes?: WebGLContextAttributes,
    pixelRatio?: number,
    width: number,
    height: number,
    style?: any,
    debug?: number
  },
  {
    error: ?Error
  }
> {
  state = {
    error: null
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
      const { canvas } = this;
      invariant(canvas, "canvas is not settled in GLViewDOM#componentDidMount");
      canvas.addEventListener("webglcontextlost", this._onContextLost);
      canvas.addEventListener("webglcontextrestored", this._onContextRestored);
    } else {
      onContextFailure(new Error("no-webgl-context"));
    }
  }

  componentWillUnmount() {
    if (this.gl) {
      loseGL(this.gl);
      this.gl = null;
    }
    const { canvas } = this;
    if (canvas) {
      canvas.removeEventListener("webglcontextlost", this._onContextLost);
      canvas.removeEventListener(
        "webglcontextrestored",
        this._onContextRestored
      );
    }
  }

  render() {
    const { error } = this.state;
    let { width, height, pixelRatio, style, debug, ...rest } = this.props;
    if (!pixelRatio)
      pixelRatio = Number(
        (typeof window === "object" && window.devicePixelRatio) || 1
      );
    for (let k in propTypes) {
      if (rest.hasOwnProperty(k)) {
        delete rest[k];
      }
    }
    return (
      <span
        style={{
          ...style,
          display: "inline-block",
          position: "relative",
          width,
          height
        }}
      >
        <canvas
          ref={this.onRef}
          style={{ width, height }}
          width={width * pixelRatio}
          height={height * pixelRatio}
          {...rest}
        />
        {error ? <ErrorDebug error={error} /> : null}
      </span>
    );
  }

  _createContext() {
    const { webglContextAttributes, debug } = this.props;
    const gl: ?WebGLRenderingContext = getContext(
      this.canvas,
      debug
        ? { ...webglContextAttributes, preserveDrawingBuffer: true }
        : webglContextAttributes
    );
    this.webglContextAttributes = webglContextAttributes || {};
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

  debugError = !__DEV__
    ? null
    : (error: Error) => {
        this.setState({ error });
      };

  afterDraw = !__DEV__
    ? null
    : () => {
        if (this.state.error) {
          this.setState({ error: null });
        }
      };

  captureAsDataURL(...args: any): string {
    if (!this.webglContextAttributes.preserveDrawingBuffer) {
      console.warn(
        "Surface#captureAsDataURL is likely to not work if you don't define webglContextAttributes={{ preserveDrawingBuffer: true }}"
      );
    }
    invariant(this.canvas, "canvas is no longer available");
    return this.canvas.toDataURL(...args);
  }

  captureAsBlob(...args: any): Promise<Blob> {
    if (!this.webglContextAttributes.preserveDrawingBuffer) {
      console.warn(
        "Surface#captureAsBlob is likely to not work if you don't define webglContextAttributes={{ preserveDrawingBuffer: true }}"
      );
    }
    return Promise.resolve().then(
      () =>
        new Promise((resolve, reject) =>
          this.canvas
            ? this.canvas.toBlob(resolve, ...args)
            : reject(new Error("canvas is no longer available"))
        )
    );
  }
}
