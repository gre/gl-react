//@flow
import React, { Component } from "react";
import { Surface } from "../../gl-react-implementation";

// Reuse that previous HelloBlue component to animate it...
import { HelloBlue } from "../helloblue";

// timeLoop is an utility that animates a component.
// in a requestAnimationFrame loop and provide a time and tick prop
import timeLoop from "../../HOC/timeLoop";

export default timeLoop(
  class Example extends Component {
    render() {
      const { time, width } = this.props;
      return (
        <Surface style={{ width, height: width }}>
          <HelloBlue blue={0.5 + 0.5 * Math.cos(time / 500)} />
        </Surface>
      );
    }
  }
);
