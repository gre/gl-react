//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";
import { GameOfLife } from "../gol";
import { Rotating } from "../golrot";

class PureGameOfLife extends Component {
  shouldComponentUpdate({ tick }) {
    // only tick should trigger redraw
    return tick !== this.props.tick;
  }
  render() {
    return <GameOfLife tick={this.props.tick} />;
  }
}

const RotatingGameOfLife = ({ time }) => (
  <Rotating
    angle={(time / 1000) % (2 * Math.PI)}
    scale={0.6 + 0.15 * Math.cos(time / 500)}
  >
    <PureGameOfLife tick={Math.floor(time / 200)} />
  </Rotating>
);

export const RotatingGameOfLifeLoop = timeLoop(RotatingGameOfLife);

export default class Example extends Component {
  render() {
    return (
      <Surface width={500} height={500}>
        <RotatingGameOfLifeLoop />
      </Surface>
    );
  }
}
