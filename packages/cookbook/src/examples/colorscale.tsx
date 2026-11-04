import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { assetUrl } from "../utils/assetUrl";

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
  spectral: assetUrl("colorscale-spectral.png"),
  OrRd: assetUrl("colorscale-OrRd.png"),
  PuBu: assetUrl("colorscale-PuBu.png"),
  Oranges: assetUrl("colorscale-Oranges.png"),
  Reds: assetUrl("colorscale-Reds.png"),
  Blues: assetUrl("colorscale-Blues.png"),
  Greens: assetUrl("colorscale-Greens.png"),
  Greys: assetUrl("colorscale-Greys.png"),
  YlOrBr: assetUrl("colorscale-YlOrBr.png"),
  BuGn: assetUrl("colorscale-BuGn.png"),
  RdYlGn: assetUrl("colorscale-RdYlGn.png"),
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
