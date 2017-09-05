//@flow
import React from "react";
import {
  Shaders,
  Node,
  LinearCopy,
  NearestCopy,
  GLSL,
  Visitor,
  Uniform,
  Bus,
  VisitorLogger,
  connectSize
} from "gl-react";
import { Surface } from "gl-react-headless";

const shaders = Shaders.create({
  a: {
    frag: GLSL`...`
  },
  b: {
    frag: "..."
  }
});

class A extends React.Component {
  surface: ?Surface;
  node: ?Node;
  doThings() {
    const { surface, node } = this;
    if (surface && node) {
      surface.redraw();
      node.redraw();
      surface.flush();
      node.flush();
      surface.capture(0, 0, 1, 1).transpose(1, 0, 2);
      node.capture(0, 0, 1, 1).transpose(1, 0, 2);
    }
  }
  render() {
    return (
      <Surface ref={ref => (this.surface = ref)} width={100} height={200}>
        <Bus ref="foo">
          <Node shader={shaders.b} />
        </Bus>
        <Bus ref="bar">
          <canvas />
        </Bus>
        <LinearCopy>
          <Node
            ref={ref => (this.node = ref)}
            width={1}
            height={1}
            shader={shaders.a}
            backbuffering
            uniformsOptions={{
              foo: { interpolation: "nearest" },
              b: { interpolation: "linear" }
            }}
            uniforms={{
              foo: () => this.refs.foo,
              bar: () => this.refs.bar,
              b: Uniform.Backbuffer,
              bs: Uniform.textureSize(""),
              br: Uniform.textureSizeRatio("")
            }}
          />
        </LinearCopy>
      </Surface>
    );
  }
}

const N = connectSize(({ width, height }) => (
  <Node
    sync
    clear={null}
    width={width}
    height={height}
    blendFunc={{ src: "one", dst: "zero" }}
    shader={shaders.b}
  />
));

const B = () => (
  <Surface
    width={100}
    height={200}
    visitor={new VisitorLogger()}
    preload={["https://i.imgur.com/5EOyTDQ.jpg"]}
    style={{ margin: 10 }}
  >
    <NearestCopy>
      <N width={10} height={10} />
    </NearestCopy>
  </Surface>
);
