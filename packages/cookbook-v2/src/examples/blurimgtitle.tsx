import React, { useRef, useEffect, useCallback } from "react";
import { Shaders, Node, GLSL, Bus, LinearCopy, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import { Blur1D } from "./blurxy";
import { BlurV as BlurMulti } from "./blurmulti";
import { BlurV } from "./blurmap";

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

const AveragePixels = ({
  children,
  quality,
}: {
  children: any;
  quality: number;
}) => (
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

const TitleBlurMap = ({
  children: title,
  threshold,
}: {
  children: any;
  threshold: number;
}) => (
  <Node
    shader={shaders.TitleBlurMap}
    uniforms={{
      threshold,
      t: (
        <BlurMulti factor={4} width={200} height={200}>
          {title}
        </BlurMulti>
      ),
    }}
    width={64}
    height={64}
  />
);

function Title({
  children,
  width,
  height,
}: {
  children: string;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.font = "bold 78px Didot,Georgia,serif";
      ctx.fillStyle = "#000";
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      const lines = children.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, 10 + i * 84);
      });
    }
    return canvas;
  }, [children, width, height]);

  return <LinearCopy>{getCanvas()}</LinearCopy>;
}

const ImageTitleC = connectSize(
  ({
    width,
    height,
    children: img,
    text,
    colorThreshold,
  }: {
    width: number;
    height: number;
    children: any;
    text: string;
    colorThreshold: number;
  }) => {
    const titleRef = useRef<any>(null);
    const blurMapRef = useRef<any>(null);
    const imgToneRef = useRef<any>(null);
    const imgBlurredRef = useRef<any>(null);

    return (
      <Node
        shader={shaders.ImageTitle}
        uniforms={{
          colorThreshold,
          img,
          imgBlurred: () => imgBlurredRef.current,
          title: () => titleRef.current,
          imgTone: () => imgToneRef.current,
          blurMap: () => blurMapRef.current,
        }}
      >
        <Bus ref={titleRef}>
          <Title width={width} height={height}>
            {text}
          </Title>
        </Bus>

        <Bus ref={blurMapRef}>
          <TitleBlurMap threshold={0.7}>
            {() => titleRef.current}
          </TitleBlurMap>
        </Bus>

        <Bus ref={imgToneRef}>
          <AveragePixels quality={8}>{img}</AveragePixels>
        </Bus>

        <Bus ref={imgBlurredRef}>
          <BlurV map={() => blurMapRef.current} factor={4} passes={4}>
            {img}
          </BlurV>
        </Bus>
      </Node>
    );
  }
);

export default function BlurImgTitle({
  title = "Hello\nSan Francisco\n\u263B",
  colorThreshold = 0.6,
  image = "https://i.imgur.com/5EOyTDQ.jpg",
}: {
  title?: string;
  colorThreshold?: number;
  image?: string;
}) {
  return (
    <Surface width={450} height={300}>
      <ImageTitleC text={title} colorThreshold={colorThreshold}>
        {image}
      </ImageTitleC>
    </Surface>
  );
}
