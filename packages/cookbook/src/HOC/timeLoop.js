//@flow
import React, { PureComponent } from "react";
import raf from "raf";
import hoistNonReactStatics from "hoist-non-react-statics";

// NB this is only an utility for the examples
export default (
  C: ReactClass<*>,
  { refreshRate = 60 }: { refreshRate?: number } = {}
): ReactClass<*> => {
  class TL extends PureComponent {
    static displayName = `timeLoop(${C.displayName||C.name||""})`;
    state: { time: number };
    state = {
      time: 0,
      tick: 0,
    };
    _r: any;
    componentDidMount() {
      let startTime: number, lastTime: number;
      let interval = 1000 / refreshRate;
      lastTime = -interval;
      const loop = (t: number) => {
        this._r = raf(loop);
        if (!startTime) startTime = t;
        if (t - lastTime > interval) {
          lastTime = t;
          this.setState({
            time: t - startTime,
            tick: this.state.tick + 1,
          });
        }
      };
      this._r = raf(loop);
    }
    componentWillUnmount() {
      raf.cancel(this._r);
    }
    render() {
      return <C
        {...this.props}
        {...this.state}
      />;
    }
  }

  hoistNonReactStatics(TL, C);

  return TL;
};
