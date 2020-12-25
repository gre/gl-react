//@flow
import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Node, Visitor, GLSL } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import timeLoop from "../../HOC/timeLoop";

const styles = StyleSheet.create({
  compileRoot: {
    flexDirection: "row",
  },
  compile: {
    padding: 6,
    backgroundColor: "#000",
    color: "#c22",
    fontSize: 10,
    fontFamily: "Courier New",
  },
  compileError: {
    color: "#c22",
  },
  compileSuccess: {
    color: "#2c2",
  },
});

const Preview = timeLoop(({ frag, visitor, time, width, height }) => (
  <Surface style={{ width, height: height / 3 }} visitor={visitor}>
    <Node shader={{ frag }} uniforms={{ time: time / 1000 }} />
  </Surface>
));

class DisplayError extends Component {
  props: { error: ?string };
  render() {
    const { error } = this.props;
    if (!error)
      return (
        <Text style={[styles.compile, styles.compileSuccess]}>
          Compilation success!
        </Text>
      );
    let err = error.message;
    const i = err.indexOf("ERROR:");
    if (i !== -1) err = "line " + err.slice(i + 9);
    return <Text style={[styles.compile, styles.compileError]}>{err}</Text>;
  }
}

export default class Example extends Component {
  constructor() {
    super();
    const visitor = new Visitor();
    visitor.onSurfaceDrawError = (error: Error) => {
      this.setState({ error });
      return true;
    };
    visitor.onSurfaceDrawEnd = () => this.setState({ error: null });
    this.state = { error: null, visitor };
  }

  render() {
    const { frag, width, height } = this.props;
    const { error, visitor } = this.state;
    return (
      <View>
        <Preview frag={frag} visitor={visitor} width={width} height={height} />
        <DisplayError error={error} />
      </View>
    );
  }

  props: { frag: string };
  state: { error: ?Error, visitor: Visitor };
  static defaultProps = {
    // adapted from http://glslsandbox.com/e#27937.0
    frag: GLSL`precision highp float;
varying vec2 uv;

uniform float time;

void main() {
  float amnt;
  float nd;
  vec4 cbuff = vec4(0.0);
  for(float i=0.0; i<5.0;i++){
    nd = sin(3.17*0.8*uv.x + (i*0.1+sin(+time)*0.2) + time)*0.8+0.1 + uv.x;
    amnt = 1.0/abs(nd-uv.y)*0.01;
    cbuff += vec4(amnt, amnt*0.3 , amnt*uv.y, 90.0);
  }
  for(float i=0.0; i<1.0;i++){
    nd = sin(3.14*2.0*uv.y + i*40.5 + time)*90.3*(uv.y+80.3)+0.5;
    amnt = 1.0/abs(nd-uv.x)*0.015;
    cbuff += vec4(amnt*0.2, amnt*0.2 , amnt*uv.x, 1.0);
  }
  gl_FragColor = cbuff;
}
`,
  };
}
