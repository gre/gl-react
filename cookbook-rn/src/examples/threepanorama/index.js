//@flow
import React, { Component } from "react";
import EXGLView from "gl-react-native/lib/EXGLView";
import demo from "./demo";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

const Demo = respondToTouchPosition(class Demo extends Component {
  props: { width: number };
  demoHooks: *;
  onContextCreate = (gl: WebGLRenderingContext) => {
    this.demoHooks = demo(gl, this.props);
  };
  componentWillReceiveProps (nextProps: *) {
    const {demoHooks} = this;
    if (demoHooks) demoHooks.onPropsChange(nextProps);
  }
  componentWillUnmount() {
    const {demoHooks} = this;
    if (demoHooks) demoHooks.dispose();
  }
  render() {
    const { width } = this.props;
    return (
      <EXGLView
        style={{ width, height: width }}
        onContextCreate={this.onContextCreate}
      />
    );
  }
});

export default class Example extends Component {
  render() {
    return <Demo {...this.props} />;
  }
  static defaultProps = { fov: 50 };
  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    fov: React.PropTypes.number.isRequired,
  };
}
