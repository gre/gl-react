import React, {Component} from "react";
import getGLReactImplementation from "../gl-react-implementation";
const {EXGLView} = getGLReactImplementation();

type DemoFunction<Props> =
  (gl: WebGLRenderingContext, initialProps: Props) =>
  {
    onPropsChange: (props: Props) => void,
    dispose: () => void,
  };

export default <Props>(demoFunction: DemoFunction<Props>) =>
  class Demo extends Component {
    props: { style: any };
    demoHooks: *;
    onContextCreate = (gl: WebGLRenderingContext) => {
      this.demoHooks = demoFunction(gl, this.props);
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
      const { style } = this.props;
      return (
        <EXGLView
          style={style}
          onContextCreate={this.onContextCreate}
        />
      );
    }
  };
