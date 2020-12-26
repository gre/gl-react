module.exports=`//@flow
import React, { Component, PureComponent } from "react";
import { Shaders, Node, GLSL, Bus, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import { DesertPassageLoop } from "../demodesert";
import "./index.css";

const shaders = Shaders.create({
  crt: {
    // adapted from http://bit.ly/2eR1iKi
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D rubyTexture;
uniform vec2 rubyInputSize;
uniform vec2 rubyOutputSize;
uniform vec2 rubyTextureSize;
uniform float distortion;
#define TEX2D(c) pow(texture2D(rubyTexture, (c)), vec4(inputGamma))
#define FIX(c)   max(abs(c), 1e-6);
#define PI 3.141592653589
#define phase 0.0
#define inputGamma 2.2
#define outputGamma 2.5
vec2 radialDistortion(vec2 coord) {
        coord *= rubyTextureSize / rubyInputSize;
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc) * distortion;
        return (coord + cc * (1.0 + dist) * dist) * rubyInputSize / rubyTextureSize;
}
vec4 scanlineWeights(float distance, vec4 color)
{
        vec4 wid = 2.0 + 2.0 * pow(color, vec4(4.0));
        vec4 weights = vec4(distance * 3.333333);
        return 0.51 * exp(-pow(weights * sqrt(2.0 / wid), wid)) / (0.18 + 0.06 * wid);
}
void main()
{
        vec2 one = 1.0 / rubyTextureSize;
        vec2 xy = radialDistortion(uv.xy);
        vec2 uv_ratio = fract(xy * rubyTextureSize) - vec2(0.5);
        xy = (floor(xy * rubyTextureSize) + vec2(0.5)) / rubyTextureSize;
        vec4 coeffs = PI * vec4(1.0 + uv_ratio.x, uv_ratio.x, 1.0 - uv_ratio.x, 2.0 - uv_ratio.x);
        coeffs = FIX(coeffs);
        coeffs = 2.0 * sin(coeffs) * sin(coeffs / 2.0) / (coeffs * coeffs);
        coeffs /= dot(coeffs, vec4(1.0));
        vec4 col  = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, 0.0))   + coeffs.y * TEX2D(xy)                    + coeffs.z * TEX2D(xy + vec2(one.x, 0.0)) + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, 0.0)),   0.0, 1.0);
        vec4 col2 = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, one.y)) + coeffs.y * TEX2D(xy + vec2(0.0, one.y)) + coeffs.z * TEX2D(xy + one)              + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, one.y)), 0.0, 1.0);
        vec4 weights  = scanlineWeights(abs(uv_ratio.y) , col);
        vec4 weights2 = scanlineWeights(1.0 - uv_ratio.y, col2);
        vec3 mul_res  = (col * weights + col2 * weights2).xyz;
        float mod_factor = uv.x * rubyOutputSize.x * rubyTextureSize.x / rubyInputSize.x;
        vec3 dotMaskWeights = mix(
                vec3(1.05, 0.75, 1.05),
                vec3(0.75, 1.05, 0.75),
                floor(mod(mod_factor, 2.0))
            );
        mul_res *= dotMaskWeights;
        mul_res = pow(mul_res, vec3(1.0 / (2.0 * inputGamma - outputGamma)));
        gl_FragColor = vec4(mul_res, 1.0);
}\`,
  },
  copy: {
    frag: GLSL\`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main(){
    gl_FragColor=texture2D(t,uv);
  }\`,
  },
});

class CRT extends Component {
  props: {
    children?: any,
    distortion: number,
    inSize: [number, number],
    outSize: [number, number],
    texSize: [number, number],
  };
  render() {
    const { children, inSize, outSize, texSize, distortion } = this.props;
    return (
      <Node
        shader={shaders.crt}
        uniforms={{
          rubyTexture: children,
          rubyInputSize: inSize,
          rubyOutputSize: outSize,
          rubyTextureSize: texSize,
          distortion,
        }}
      />
    );
  }
}

const Desert = connectSize(DesertPassageLoop);

class ShowCaptured extends PureComponent {
  render() {
    const { t } = this.props;
    return (
      <Surface width={200} height={200}>
        <Node shader={shaders.copy} uniforms={{ t }} />
      </Surface>
    );
  }
}

export default class Example extends Component {
  state = {
    surfacePixels: null,
    desertPixels: null,
  };

  onCapture = () =>
    this.setState({
      surfacePixels: this.refs.surface.capture(),
      desertPixels: this.refs.desert.capture(),
    });

  render() {
    const { distortion } = this.props;
    const { surfacePixels, desertPixels } = this.state;
    return (
      <div>
        <Surface
          ref="surface"
          width={400}
          height={400}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Bus ref="desert">
            {/* we use a Bus to have a ref for capture */}
            <Desert width={128} height={128} />
          </Bus>

          <CRT
            distortion={distortion}
            texSize={[128, 128]}
            inSize={[128, 128]}
            outSize={[400, 400]}
          >
            {() => this.refs.desert}
          </CRT>
        </Surface>

        <div className="buttons">
          <button onClick={this.onCapture}>capture</button>
        </div>
        <div className="snaps">
          <ShowCaptured t={surfacePixels} />
          <ShowCaptured t={desertPixels} />
        </div>
      </div>
    );
  }

  static defaultProps = {
    distortion: 0.2,
  };
}
`
