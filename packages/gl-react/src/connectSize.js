//@flow
import React, { Component, PropTypes } from "react";

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
const connectSize = (GLComponent: ReactClass<*> | (props: any)=>React.Element<*>) => class extends Component {
  props: {
    width?: number,
    height?: number,
    children?: any,
  };
  context: {
    width: number,
    height: number,
  };
  static displayName = `connectSize(${GLComponent.displayName||GLComponent.name||"?"})`;
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
  };
  static contextTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  static childContextTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };
  getChildContext(): { width: number, height: number } {
    const { props, context } = this;
    return {
      width: props.width || context.width,
      height: props.height || context.height,
    };
  }
  render() {
    const { width, height } = this.getChildContext();
    return <GLComponent
      {...this.props}
      width={width}
      height={height}
    />;
  }
};

export default connectSize;
