import React from "react";
import { LinearCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import GLTransition from "react-gl-transition";
import GLTransitions from "gl-transitions";
import timeLoop from "../../HOC/timeLoop";
import images from "./images";

const Slideshow = timeLoop(({ slides, delay, duration, time }) => {
  const index = Math.floor(time / (delay + duration));
  const from = slides[index % slides.length];
  const to = slides[(index + 1) % slides.length];
  const transition = GLTransitions[index % GLTransitions.length];
  const total = delay + duration;
  const progress = (time - index * total - delay) / duration;
  return progress > 0 ? (
    <GLTransition
      from={from}
      to={to}
      progress={progress}
      transition={transition}
    />
  ) : (
    <LinearCopy>{from}</LinearCopy>
  );
});

export default () => (
  <Surface width={600} height={400}>
    <Slideshow slides={images} delay={2000} duration={1500} />
  </Surface>
);
