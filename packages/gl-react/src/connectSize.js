//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";

/**
 * A High Order Component (HOC) function that provides
 * the contextual `width` and `height` props to a GL Component.
 * It also merge optional width,height props to override the contextual size
 * @function connectSize
 * @param GLComponent - a React Component that receives width and height props
 * @returns {ReactClass<*>} a Component that merge width and height props
 * with context and renders `GLComponent`.
 * @example
 *  const Foo = ({ width, height }) => <Node uniforms={{ width, height }} />;
 *  const FooConnected = connectSize(Foo);
 *  <FooConnected /> // you don't have to provide width, height.
 *  <FooConnected width={64} height={64} /> // If you do, you override width,height in the context as well, so <Node> is implicitly receiving the new width/height.
 */
const connectSize = (GLComponent: *) =>
  class extends Component<{
    width?: number,
    height?: number,
    children?: any,
    onConnectSizeComponentRef?: (ref: GLComponent) => void,
  }> {
    context: {
      glSizable: { +getGLSize: () => [number, number] },
    };
    static displayName = `connectSize(${
      GLComponent.displayName || GLComponent.name || "?"
    })`;
    static propTypes = {
      width: PropTypes.number,
      height: PropTypes.number,
    };
    static contextTypes = {
      glSizable: PropTypes.object.isRequired,
    };
    static childContextTypes = {
      glSizable: PropTypes.object.isRequired,
    };
    getGLSize(): [number, number] {
      const {
        props: { width, height },
        context: { glSizable },
      } = this;
      if (width && height) return [width, height];
      const [cw, ch] = glSizable.getGLSize();
      return [width || cw, height || ch];
    }
    getChildContext() {
      return {
        glSizable: this,
      };
    }
    render() {
      const { onConnectSizeComponentRef } = this.props;
      const [width, height] = this.getGLSize();
      return (
        <GLComponent
          ref={onConnectSizeComponentRef}
          {...this.props}
          width={width}
          height={height}
        />
      );
    }
  };

export default connectSize;
