//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";

const shaders = Shaders.create({
  YFlip: {
    // NB we need to YFlip the stream
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t, vec2(uv.x, 1.0 - uv.y));
}`,
  },
});

export default class Camera extends Component {
  props: {
    position: string,
  };
  static defaultProps = {
    position: "front",
  };
  _raf: *;
  componentDidMount() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.forceUpdate();
    };
    this._raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() {
    cancelAnimationFrame(this._raf);
  }
  render() {
    const { position } = this.props;
    return (
      <Node
        blendFunc={{ src: "one", dst: "one minus src alpha" }}
        shader={shaders.YFlip}
        uniforms={{
          t: { camera: { position } },
        }}
      />
    );
  }
}
