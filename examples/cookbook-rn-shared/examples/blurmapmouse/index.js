//@flow
import React, { Component } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import { BlurV } from "../blurmap";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

const shaders = Shaders.create({
  Offset: {
    frag: GLSL`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 offset;
void main () {
  gl_FragColor = texture2D(t, uv + offset);
}`,
  },
});

const Offset = ({ t, offset }) => (
  <Node shader={shaders.Offset} uniforms={{ t, offset }} />
);

const Example = respondToTouchPosition(
  class Example extends Component {
    render() {
      const { map, touching, touchPosition, width } = this.props;
      // Sharing computation of a GL Node.
      // <Offset /> should not be passed straight to BlurV's map because
      // it would duplicates it in the tree ([passes] times)
      // Instead, we need to express a graph and share the
      // computation with a Bus ref.
      // We pass to BlurV's map prop a function that resolve that ref.
      return (
        <Surface style={{ width, height: (width * 142) / 300 }}>
          <Bus ref="blurMapBus">
            <Offset
              offset={
                touching
                  ? [touchPosition.x - 0.5, touchPosition.y - 0.5]
                  : [0, 0]
              }
              t={map}
            />
          </Bus>
          <BlurV map={() => this.refs.blurMapBus} passes={6} factor={6}>
            {{ uri: "https://i.imgur.com/NjbLHx2.jpg" }}
          </BlurV>
        </Surface>
      );
    }
  }
);

Example.defaultProps = {
  map: StaticBlurMap.images[0],
};

export default Example;

import StaticBlurMap from "../../toolbox/StaticBlurMap";
