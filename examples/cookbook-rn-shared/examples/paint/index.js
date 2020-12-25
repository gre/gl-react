import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

const shaders = Shaders.create({
  paint: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
uniform float ratio;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d * vec2(ratio, 1.0)) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
} `,
  },
});

export default respondToTouchPosition(
  class Example extends Component {
    props: {
      touching: boolean,
      touchPosition: { x: number, y: number },
      width: number,
      height: number,
    };

    state = {
      color: [1, 0, 0, 1],
    };

    componentWillReceiveProps({ touching }) {
      const { touching: prevTouching } = this.props;
      if (!prevTouching && touching) {
        this.setState({
          color: [Math.random(), Math.random(), Math.random(), 1],
        });
      }
    }

    render() {
      const { touching, touchPosition, width, height } = this.props;
      const { color } = this.state;
      const brushRadius = 0.03 + 0.01 * Math.cos(Date.now() / 1000);
      return (
        <Surface
          style={{ width, height }}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node
            shader={shaders.paint}
            uniforms={{
              center: [touchPosition.x, touchPosition.y],
              drawing: touching,
              brushRadius,
              ratio: width / height,
              color,
            }}
            clear={null}
          />
        </Surface>
      );
      // NB: We also need to explicitely use clear=null
      // to disable the Node to clear the framebuffer,
      // and enable preserveDrawingBuffer webgl options.
    }
  }
);
