//@flow
import React, { Component, useState } from "react";
import { View, Text } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import Slider from "@react-native-community/slider";

const shaders = Shaders.create({
  hello: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
    `,
  },
});

const Test = ({ width }: { width: number }) => {
  const [size, setSize] = useState(200);
  return (
    <View>
      <Surface style={{ width: size, height: size }}>
        <Node shader={shaders.hello} />
      </Surface>

      <Slider
        minimumValue={100}
        maximumValue={300}
        step={10}
        value={size}
        onValueChange={setSize}
      />
    </View>
  );
};

export default Test;
