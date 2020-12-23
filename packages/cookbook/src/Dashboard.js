import React, { Component } from "react";
import { Link } from "react-router-dom";
import Code from "./Code";
import { Surface } from "gl-react-dom";
import { Node, Shaders, GLSL, Uniform, LinearCopy } from "gl-react";
import timeLoop from "./HOC/timeLoop";
import "./Dashboard.css";
import Inspector from "./Inspector";

const shaders = Shaders.create({
  MotionBlur: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children, backbuffer;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(children, uv),
    texture2D(backbuffer, uv),
    persistence
  ).rgb, 1.0);
}`,
  },
  HelloGL: {
    // uniforms are variables from JS. We pipe blue uniform into blue output color
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float red;
void main() {
  gl_FragColor = vec4(red, uv.x, uv.y, 1.0);
}`,
  },
  Rotate: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float angle, scale;
uniform sampler2D children;
void main() {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - vec2(0.5)) * rotation / scale + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.0)
    : texture2D(children, p);
}`,
  },
});

const MotionBlur = ({ children, persistence }) => (
  <Node
    shader={shaders.MotionBlur}
    backbuffering
    uniforms={{ children, backbuffer: Uniform.Backbuffer, persistence }}
  />
);

// We can make a <HelloBlue blue={0.5} /> that will render the concrete <Node/>
class HelloGL extends Component {
  props: {
    red: number,
  };
  render() {
    const { red } = this.props;
    return <Node shader={shaders.HelloGL} uniforms={{ red }} />;
  }
}

class Rotate extends Component {
  props: {
    scale: number,
    angle: number,
    children: any,
  };
  render() {
    const { angle, scale, children } = this.props;
    return (
      <Node shader={shaders.Rotate} uniforms={{ scale, angle, children }} />
    );
  }
}

class Ex1 extends Component {
  props: { time: number };
  state = {
    showCode: false,
    showInspector: false,
  };
  onShowCode = () => {
    this.setState({ showCode: true });
  };
  onShowInspector = () => {
    this.setState({ showInspector: true });
  };
  render() {
    const { time } = this.props;
    const { showCode, showInspector } = this.state;
    const persistence = 0.75 - 0.2 * Math.cos(0.0005 * time);
    const red = 0.6 + 0.4 * Math.cos(0.004 * time);
    const scale = 0.7 + 0.4 * Math.cos(0.001 * time);
    const angle = 2 * Math.PI * (0.5 + 0.5 * Math.cos(0.001 * time));
    return (
      <div className="ex">
        <header>
          <Surface width={200} height={200}>
            <LinearCopy>
              <MotionBlur persistence={persistence}>
                <Rotate scale={scale} angle={angle}>
                  <HelloGL red={red} />
                </Rotate>
              </MotionBlur>
            </LinearCopy>
          </Surface>
          {!showCode ? (
            <div onClick={this.onShowCode} className="showcode">
              SHOW ME THE CODE!
            </div>
          ) : (
            <Code>{`  <Surface width={200} height={200}>
      <MotionBlur persistence={${persistence.toFixed(2)}}>
        <Rotate scale={${scale.toFixed(2)}} angle={${angle.toFixed(2)}}>
          <HelloGL red={${red.toFixed(1)}} />
        </Rotate>
      </MotionBlur>
    </Surface>`}</Code>
          )}
        </header>
        {showCode ? (
          !showInspector ? (
            <div onClick={this.onShowInspector} className="showunderthehood">
              SHOW ME UNDER THE HOOD!
            </div>
          ) : (
            <Inspector />
          )
        ) : null}
      </div>
    );
  }
}

const Ex1Loop = timeLoop(Ex1);

export default class Dashboard extends Component {
  render() {
    return (
      <div className="dashboard">
        <h2>
          gl-react is a <a href="http://facebook.github.io/react/">React</a>{" "}
          library to write and compose WebGL shaders.
        </h2>
        <Ex1Loop />
        <nav>
          <Link to="/hellogl">Checkout more examples</Link>
          <a href="http://greweb.me/2016/12/gl-react-v3/">
            gl-react-v3 release article
          </a>
          <a href="http://github.com/gre/gl-react">
            Explore source code on Github
          </a>
          <a href="https://gitter.im/gl-react">Chat with us</a>
        </nav>
      </div>
    );
  }
}
