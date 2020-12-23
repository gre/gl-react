//@flow
import React, { PureComponent, Component } from "react";
import PropTypes from "prop-types";
import { Shaders, Node, GLSL, Bus, LinearCopy, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import { Blur1D } from "../blurxy";
import { Blur } from "../blurmulti";
import { BlurV } from "../blurmap";

const shaders = Shaders.create({
  ImageTitle: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D img, imgBlurred, imgTone, title, blurMap;
uniform float colorThreshold;
float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}
void main() {
  float blurFactor = texture2D(blurMap, uv).r;
  vec4 bgColor = mix(
    texture2D(img, uv),
    texture2D(imgBlurred, uv),
    step(0.01, blurFactor)
  );
  vec4 textColor = vec4(vec3(
    step(monochrome(texture2D(imgTone, uv).rgb), colorThreshold)
  ), 1.0);
  float isText = 1.0 - texture2D(title, uv).r;
  gl_FragColor = mix(bgColor, textColor, isText);
}`,
  },
  TitleBlurMap: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float threshold;
void main() {
gl_FragColor = vec4(
  vec3(smoothstep(1.0, threshold, texture2D(t, uv).r)),
  1.0);
}`,
  },
});

const AveragePixels = ({ children, quality }) => (
  <Blur1D width={1} height={1} resolution={[1, 1]} direction={[0, 0.1]}>
    <Blur1D
      width={1}
      height={quality}
      resolution={[1, quality]}
      direction={[0.1, 0]}
    >
      {children}
    </Blur1D>
  </Blur1D>
);

const TitleBlurMap = ({ children: title, threshold }) => (
  <Node
    shader={shaders.TitleBlurMap}
    uniforms={{
      threshold,
      t: (
        <Blur factor={4} passes={4} width={200} height={200}>
          {title}
        </Blur>
      ),
    }}
    width={64}
    height={64}
  />
);

class Title extends PureComponent {
  render() {
    const { children, width, height } = this.props;
    return (
      <LinearCopy>
        <JSON2D width={width} height={height}>
          {{
            size: [width, height],
            background: "#fff",
            draws: [
              {
                font: "bold 78px Didot,Georgia,serif",
                fillStyle: "#000",
                textBaseline: "top",
                textAlign: "center",
              },
              ["fillText", children, width / 2, 10, 84],
            ],
          }}
        </JSON2D>
      </LinearCopy>
    );
  }
}

class ImageTitleC extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    children: PropTypes.any.isRequired,
    text: PropTypes.string.isRequired,
    colorThreshold: PropTypes.number.isRequired,
  };
  render() {
    const { width, height, children: img, text, colorThreshold } = this.props;
    return (
      <Node
        shader={shaders.ImageTitle}
        uniforms={{
          colorThreshold,
          img,
          imgBlurred: () => this.refs.imgBlurred,
          title: () => this.refs.title,
          imgTone: () => this.refs.imgTone,
          blurMap: () => this.refs.blurMap,
        }}
      >
        <Bus ref="title">
          <Title width={width} height={height}>
            {text}
          </Title>
        </Bus>

        <Bus ref="blurMap">
          <TitleBlurMap threshold={0.7}>{() => this.refs.title}</TitleBlurMap>
        </Bus>

        <Bus ref="imgTone">
          <AveragePixels quality={8}>{img}</AveragePixels>
        </Bus>

        <Bus ref="imgBlurred">
          <BlurV map={() => this.refs.blurMap} factor={4} passes={4}>
            {img}
          </BlurV>
        </Bus>
      </Node>
    );
  }
}
const ImageTitle = connectSize(ImageTitleC);

export default class Example extends Component {
  render() {
    const { title, colorThreshold, image } = this.props;
    return (
      <Surface width={450} height={300}>
        <ImageTitle text={title} colorThreshold={colorThreshold}>
          {image}
        </ImageTitle>
      </Surface>
    );
  }

  static defaultProps = {
    title: "Hello\nSan Francisco\n☻",
    colorThreshold: 0.6,
    image: require("./sf-6.jpg").default,
  };
}
