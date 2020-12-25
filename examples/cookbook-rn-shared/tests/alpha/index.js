//@flow
import React, { Component } from "react";
import { View, Text } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";

const shaders = Shaders.create({
  alpha: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(
    0.0, 0.0, 1.0,
    1.0 - min(1.0, step(uv.y, 0.5) + max(0.0, (1.0-3.0*distance(uv.y, 0.5))*step(0.4, uv.x)*step(uv.x, 0.6))) *
    step(distance(uv, vec2(0.5)), 0.4)
  );
}`,
  },
});

export default class Test extends Component {
  render() {
    const { width } = this.props;
    return (
      <View>
        <View style={{ backgroundColor: "#FF0000" }}>
          <Surface style={{ width, height: width }}>
            <Node shader={shaders.alpha} />
          </Surface>
        </View>
        <Text style={{ padding: 10, fontStyle: "italic" }}>
          You should see a submarine surounded by blue. The top of the submarine
          should fade away. The submarine should be full RED. if it is PINK,
          there is a pre-multiplied alpha issue.
        </Text>
      </View>
    );
  }
}
