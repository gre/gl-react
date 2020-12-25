//@flow
import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";
import { Camera } from "expo-camera";

const shaders = Shaders.create({
  Flip: {
    // NB we need to Flip the stream
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t, vec2(1.0 - uv.x, 1.0 - uv.y));
}`,
  },
});

export class GLCamera extends Component<*> {
  props: {
    position: string,
  };
  static defaultProps = {
    position: "front",
  };
  _raf: *;
  async componentDidMount() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.forceUpdate();
    };
    this._raf = requestAnimationFrame(loop);
  }
  componentWillUnmount() {
    cancelAnimationFrame(this._raf);
  }
  camera: ?Camera;
  onCameraRef = (camera: ?Camera) => {
    this.camera = camera;
  };
  render() {
    const { position } = this.props;
    const type = Camera.Constants.Type[position];
    return (
      <Node
        blendFunc={{ src: "one", dst: "one minus src alpha" }}
        shader={shaders.Flip}
        uniforms={{
          t: () => this.camera,
        }}
      >
        <Camera
          style={{
            width: 400,
            height: 533.33,
          }}
          ratio="4:3"
          type={type}
          ref={this.onCameraRef}
        />
      </Node>
    );
  }
}
