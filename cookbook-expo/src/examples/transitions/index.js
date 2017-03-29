import React, { Component } from "react";
import { Shaders, Node, LinearCopy, connectSize } from "gl-react";
import { Surface } from "gl-react-expo";
import timeLoop from "../../HOC/timeLoop";
import {shadersDefs, randomTransition} from "./transitions";
const shaders = Shaders.create(shadersDefs);

const Transition = connectSize(
({ shader, progress, from, to, uniforms, width, height }) =>
  <Node
    shader={shader}
    uniforms={{ progress, from, to, ...uniforms, resolution: [width,height] }}
  />);

class Slideshow extends Component {
  state = {
    index: 0,
    transition: randomTransition(),
  };
  componentWillReceiveProps ({ time, slideDuration, transitionDuration }) {
    const index = Math.floor(time / (slideDuration + transitionDuration));
    if (this.state.index !== index) {
      this.setState({
        index,
        transition: randomTransition(),
      });
    }
  }
  render() {
    const { slides, slideDuration, transitionDuration, time } = this.props;
    const { index, transition } = this.state;
    const totalDuration = slideDuration + transitionDuration;
    const progress = Math.max(0,
      (time - index * totalDuration - slideDuration) / transitionDuration);
    const from = slides[index % slides.length];
    const to = slides[(index+1) % slides.length];
    return (
      progress
      ? <Transition
          from={from}
          to={to}
          progress={progress}
          shader={shaders[transition.name]}
          uniforms={transition.uniforms}
        />
      : <LinearCopy>{from}</LinearCopy>
    );
  }
}
const SlideshowLoop = timeLoop(Slideshow);

import images from "./images";
export default ({ width }) =>
  <Surface style={{ width, height: Math.round(width * 0.6) }}>
    <SlideshowLoop
      slides={images}
      slideDuration={2000}
      transitionDuration={1500}
    />
  </Surface>
