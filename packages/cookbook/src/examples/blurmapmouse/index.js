//@flow
import React, { Component } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { BlurV } from "../blurmap";
import StaticBlurMap from "../../toolbox/StaticBlurMap";

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

export default class Example extends Component {
  state = {
    offset: [0, 0],
  };
  render() {
    const { map } = this.props;
    const { offset } = this.state;
    // Sharing computation of a GL Node.
    // <Offset /> should not be passed straight to BlurV's map because
    // it would duplicates it in the tree ([passes] times)
    // Instead, we need to express a graph and share the
    // computation with a Bus ref.
    // We pass to BlurV's map prop a function that resolve that ref.
    return (
      <Surface
        width={600}
        height={284}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
      >
        <Bus ref="blurMapBus">
          <Offset offset={offset} t={map} />
        </Bus>
        <BlurV map={() => this.refs.blurMapBus} passes={6} factor={6}>
          https://i.imgur.com/NjbLHx2.jpg
        </BlurV>
      </Surface>
    );
  }
  onMouseMove = (e: *) => {
    const rect = e.target.getBoundingClientRect();
    this.setState({
      offset: [
        -(e.clientX - rect.left - rect.width / 2) / rect.width,
        (e.clientY - rect.top - rect.height / 2) / rect.height,
      ],
    });
  };
  onMouseLeave = () => this.setState({ offset: [0, 0] });
  static defaultProps = {
    map: StaticBlurMap.images[0],
  };
}
