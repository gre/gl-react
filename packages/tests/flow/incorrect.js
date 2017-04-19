//@flow
import React from "react";
import {
  Shaders,
  Node,
  LinearCopy,
  NearestCopy,
  GLSL,
  Visitor,
  TextureLoader,
  TextureLoaders,
  Backbuffer,
  Bus,
  VisitorLogger,
  connectSize,
} from "gl-react";
import {
  Surface,
} from "gl-react-headless";

<Node />;
<Surface />;
<LinearCopy />;
<NearestCopy />;
<Bus />;

<Node nope />;
<Surface nope />;
<LinearCopy nope />;
<NearestCopy nope />;
<Bus nope />;

const shaders = Shaders.create({
  valid: {
    frag: GLSL`...`,
  },
  a: null,
  b: {},
  c: { frag: true },
});

class A extends React.Component {
  surface: ?Surface;
  node: ?Node;
  doThings() {
    const {surface, node} = this;
    if (surface && node) {
      surface.nope();
      node.nope();
    }
  }
  render() {
    return (
    <Surface ref={ref => this.surface=ref} notexists>
      <Bus ref="o" notexists>
        <Node />
      </Bus>
      <LinearCopy notexists>
        <Node
          shaders={shaders.valid}
          notexists
        />
      </LinearCopy>
    </Surface>
    );
  }
}

connectSize();

const N = connectSize(() =>
// these are all wrong props
<Node
  sync={1}
  clear={42}
  width={false}
  height={false}
  blendFunc={{
    src: "nope",
    interpolation: "interpolation_nope",
    wrap: "wrap_nope",
  }}
  preload={false}
  visitor={false}
  shader={false}
/>
);
