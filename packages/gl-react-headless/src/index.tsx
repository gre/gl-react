import React, { Component } from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import raf from "raf";
import { createSurface } from "gl-react";
import getContext from "./getContext";
import loseGL from "./loseGL";

type WebGLContextAttributes = {
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  preferLowPowerToHighPerformance?: boolean;
  failIfMajorPerformanceCaveat?: boolean;
};

const propTypes: { [key: string]: any } = {
  onContextLost: PropTypes.func.isRequired,
  onContextRestored: PropTypes.func.isRequired,
  onContextCreate: PropTypes.func.isRequired,
  onContextFailure: PropTypes.func.isRequired,
  webglContextAttributes: PropTypes.object,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

class GLView extends Component<{
  onContextCreate: (gl: WebGLRenderingContext) => void;
  onContextFailure: (e: Error) => void;
  onContextLost: () => void;
  onContextRestored: (gl: WebGLRenderingContext | null) => void;
  webglContextAttributes?: WebGLContextAttributes;
  width: number;
  height: number;
  [key: string]: any;
}> {
  static propTypes = propTypes;
  webglContextAttributes!: WebGLContextAttributes;
  canvas: HTMLCanvasElement | null = null;
  gl: WebGLRenderingContext | null = null;

  componentDidMount() {
    invariant(
      this.canvas,
      "GLView: canvas is not available in componentDidMount!"
    );
    const {
      webglContextAttributes,
      onContextCreate,
      onContextFailure,
    } = this.props;
    const gl = getContext(this.canvas!, webglContextAttributes);
    this.webglContextAttributes = webglContextAttributes || {};
    if (gl) {
      this.gl = gl;
      onContextCreate(gl);
    } else {
      onContextFailure(new Error("no-webgl-context"));
    }
  }

  componentDidUpdate(prevProps: any) {
    const { width, height } = this.props;
    if (prevProps.width !== width || prevProps.height !== height) {
      if (this.gl) {
        (this.gl as any)
          .getExtension("STACKGL_resize_drawingbuffer")
          .resize(width, height);
      }
    }
  }

  componentWillUnmount() {
    if (this.gl) loseGL(this.gl);
  }

  simulateContextLost() {
    this.props.onContextLost();
  }

  simulateContextRestored() {
    this.props.onContextRestored(this.gl);
  }

  captureAsDataURL() {}
  captureAsBlob() {}

  render() {
    const { width, height, ...rest } = this.props;
    for (let k in propTypes) {
      delete rest[k];
    }
    return (
      <canvas ref={this.onRef} width={width} height={height} {...rest} />
    );
  }

  onRef = (ref: HTMLCanvasElement | null) => {
    this.canvas = ref;
  };
}

class RenderLessElement extends Component<{ children?: any }> {
  static propTypes = {
    children: PropTypes.any,
  };
  refMap: Map<number, any> = new Map();
  getFirstChild = (): any => {
    const ref: any = this.refMap.get(0);
    if (ref && typeof ref.getRootRef === "function") return ref.getRootRef();
    return ref;
  };
  render() {
    const { children } = this.props;
    return (
      <span>
        {React.Children.map(children, (element: any, i: number) => {
          if (!element) return element;
          const cloneRef = (ref: any) => this.refMap.set(i, ref);
          const originalRef = element.ref;
          if (typeof originalRef === "string") {
            return element;
          }
          return React.cloneElement(element, {
            ref: !originalRef
              ? cloneRef
              : (component: any) => {
                  cloneRef(component);
                  originalRef(component);
                },
          });
        })}
      </span>
    );
  }
}

export const Surface = createSurface({
  GLView,
  RenderLessElement,
  mapRenderableContent: (el: any) => el.getFirstChild(),
  requestFrame: raf,
  cancelFrame: raf.cancel,
});
