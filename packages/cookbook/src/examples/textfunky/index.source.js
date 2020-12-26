module.exports=`//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";

const shaders = Shaders.create({
  funky: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = texture2D(t, uv) * vec4(
    0.5 + 0.5 * cos(uv.x * 30.0),
    0.5 + 0.5 * sin(uv.y * 20.0),
    0.7 + 0.3 * sin(uv.y * 8.0),
    1.0);
}\`,
  },
});
const Funky = ({ children: t }) => (
  <Node shader={shaders.funky} uniforms={{ t }} />
);

export default class Example extends Component {
  render() {
    return (
      <Surface width={400} height={200}>
        <Funky>
          <JSON2D width={400} height={200}>
            {{
              background: "#000",
              size: [400, 200],
              draws: [
                {
                  textAlign: "center",
                  fillStyle: "#fff",
                  font: "48px bold Arial",
                },
                [
                  "fillText",
                  "Hello World\\n2d canvas text\\ninjected as texture",
                  200,
                  60,
                  56,
                ],
              ],
            }}
          </JSON2D>
        </Funky>
      </Surface>
    );
  }
}
`
