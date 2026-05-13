import React from "react";
import { View, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import { colorScales } from "../shared/colorScales";

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
  gl_FragColor = vec4(texture2D(colorScale, vec2(grey, 0.5)).rgb, 1.0);
}`,
  },
});

export { colorScales };

export const Colorify = ({
  children,
  colorScale,
}: {
  children: any;
  colorScale: any;
}) => (
  <Node
    shader={shaders.colorify}
    uniforms={{ children, colorScale }}
  />
);

export default function ColorScaleExample({
  color = "spectral",
}: {
  color?: string;
}) {
  return (
    <View style={styles.center}>
      <Surface style={styles.surface}>
        <Colorify colorScale={colorScales[color] || colorScales.spectral}>
          {{ uri: "https://i.imgur.com/uTP9Xfr.jpg" }}
        </Colorify>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  surface: { width: 360, height: 225 },
});
