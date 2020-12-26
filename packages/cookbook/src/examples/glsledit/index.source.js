module.exports=`//@flow
import React, { Component } from "react";
import { Node, Visitor, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const Preview = timeLoop(({ frag, visitor, time }) => (
  <Surface width={500} height={200} visitor={visitor}>
    <Node shader={{ frag }} uniforms={{ time: time / 1000 }} />
  </Surface>
));

class DisplayError extends Component {
  render() {
    const { error } = this.props;
    if (!error)
      return <div className="compile success">Compilation success!</div>;
    let err = error.message;
    const i = err.indexOf("ERROR:");
    if (i !== -1) err = "line " + err.slice(i + 9);
    return <div className="compile error">{err}</div>;
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
    const { frag } = this.props;
    const { error, visitor } = this.state;
    return (
      <div>
        <Preview frag={frag} visitor={visitor} />
        <DisplayError error={error} />
      </div>
    );
  }

  props: { frag: string };
  state: { error: ?Error, visitor: Visitor };
  static defaultProps = {
    // adapted from http://glslsandbox.com/e#27937.0
    frag: GLSL\`precision highp float;
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
\`,
  };
}
`
