import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  colorify: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children, colorScale;
float greyscale (vec3 c) { return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b; }
void main() {
  vec4 original = texture2D(children, uv);
  float grey = greyscale(original.rgb);
  // Grayscale value indexes into the color scale gradient (1D LUT)
  gl_FragColor = vec4(texture2D(colorScale, vec2(grey, 0.5)).rgb, 1.0);
}`,
  },
});

export const colorScales: Record<string, string> = {
  spectral: "/assets/colorscale-spectral.png",
  OrRd: "/assets/colorscale-OrRd.png",
  PuBu: "/assets/colorscale-PuBu.png",
  Oranges: "/assets/colorscale-Oranges.png",
  Reds: "/assets/colorscale-Reds.png",
  Blues: "/assets/colorscale-Blues.png",
  Greens: "/assets/colorscale-Greens.png",
  Greys: "/assets/colorscale-Greys.png",
  YlOrBr: "/assets/colorscale-YlOrBr.png",
  BuGn: "/assets/colorscale-BuGn.png",
  RdYlGn: "/assets/colorscale-RdYlGn.png",
};

export const Colorify = ({
  children,
  colorScale,
}: {
  children: any;
  colorScale: string;
}) => (
  <Node
    shader={shaders.colorify}
    uniforms={{
      children,
      colorScale,
    }}
  />
);

export default function ColorScaleExample({
  color = "spectral",
}: {
  color?: string;
}) {
  return (
    <Surface width={480} height={300}>
      <Colorify colorScale={colorScales[color] || colorScales.spectral}>
        {"https://i.imgur.com/uTP9Xfr.jpg"}
      </Colorify>
    </Surface>
  );
}
