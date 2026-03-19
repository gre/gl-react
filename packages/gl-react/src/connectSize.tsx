import React, { Component } from "react";
import PropTypes from "prop-types";
import GLContext from "./GLContext";

/**
 * A High Order Component (HOC) function that provides
 * the contextual `width` and `height` props to a GL Component.
 */
const connectSize = (GLComponent: any) =>
  class extends Component<{
    width?: number;
    height?: number;
    children?: any;
    onConnectSizeComponentRef?: (ref: any) => void;
  }> {
    context!: {
      glSizable: { getGLSize: () => [number, number] };
      glParent: any;
      glSurface: any;
    };
    static displayName = `connectSize(${
      GLComponent.displayName || GLComponent.name || "?"
    })`;
    static propTypes = {
      width: PropTypes.number,
      height: PropTypes.number,
    };
    static contextType = GLContext;

    getGLSize(): [number, number] {
      const {
        props: { width, height },
        context: { glSizable },
      } = this;
      if (width && height) return [width, height];
      const [cw, ch] = glSizable.getGLSize();
      return [width || cw, height || ch];
    }
    render() {
      const { onConnectSizeComponentRef } = this.props;
      const [width, height] = this.getGLSize();
      return (
        <GLContext.Provider
          value={{
            glSizable: this,
            glParent: this.context.glParent,
            glSurface: this.context.glSurface,
          }}
        >
          <GLComponent
            ref={onConnectSizeComponentRef}
            {...this.props}
            width={width}
            height={height}
          />
        </GLContext.Provider>
      );
    }
  };

export default connectSize;
