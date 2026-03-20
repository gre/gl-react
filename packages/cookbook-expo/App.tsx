import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Shaders, Node, GLSL, Uniform, LinearCopy } from "gl-react";
import { Surface } from "gl-react-expo";

// -- Shaders --

const shaders = Shaders.create({
  helloGL: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`,
  },
  helloBlue: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`,
  },
  colorDisc: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec3 fromColor, toColor;
void main() {
  float d = distance(uv, vec2(0.5));
  gl_FragColor = mix(
    vec4(mix(fromColor, toColor, d), 1.0),
    vec4(0.0),
    step(0.5, d)
  );
}`,
  },
  rotate: {
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
  motionBlur: {
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
});

// -- Components --

function HelloGL() {
  return (
    <Surface style={styles.surface}>
      <Node shader={shaders.helloGL} />
    </Surface>
  );
}

function HelloBlue() {
  const [blue, setBlue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setBlue(0.5 + 0.5 * Math.cos((Date.now() - start) / 1000));
    }, 16);
    return () => clearInterval(id);
  }, []);
  return (
    <Surface style={styles.surface}>
      <Node shader={shaders.helloBlue} uniforms={{ blue }} />
    </Surface>
  );
}

function ColorDisc() {
  return (
    <Surface style={styles.surface}>
      <Node
        shader={shaders.colorDisc}
        uniforms={{
          fromColor: [1, 0, 0.5],
          toColor: [0.5, 0, 1],
        }}
      />
    </Surface>
  );
}

function RotatingHello() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = (Date.now() - start) / 1000;
      setAngle(2 * Math.PI * (0.5 + 0.5 * Math.cos(t)));
    }, 16);
    return () => clearInterval(id);
  }, []);
  return (
    <Surface style={styles.surface}>
      <Node
        shader={shaders.rotate}
        uniforms={{
          angle,
          scale: 0.8,
          children: <Node shader={shaders.helloGL} />,
        }}
      />
    </Surface>
  );
}

function MotionBlurDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setT((Date.now() - start) / 1000);
    }, 16);
    return () => clearInterval(id);
  }, []);
  const persistence = 0.75 - 0.2 * Math.cos(0.5 * t);
  const red = 0.6 + 0.4 * Math.cos(4 * t);
  const scale = 0.7 + 0.4 * Math.cos(t);
  const angle = 2 * Math.PI * (0.5 + 0.5 * Math.cos(t));
  return (
    <Surface style={styles.surface}>
      <LinearCopy>
        <Node
          shader={shaders.motionBlur}
          backbuffering
          uniforms={{
            children: (
              <Node
                shader={shaders.rotate}
                uniforms={{
                  angle,
                  scale,
                  children: (
                    <Node shader={shaders.helloBlue} uniforms={{ blue: red }} />
                  ),
                }}
              />
            ),
            backbuffer: Uniform.Backbuffer,
            persistence,
          }}
        />
      </LinearCopy>
    </Surface>
  );
}

// -- Example registry --

const examples = [
  { title: "Hello GL", description: "UV gradient", component: HelloGL },
  {
    title: "Hello Blue",
    description: "Animated uniform",
    component: HelloBlue,
  },
  {
    title: "Color Disc",
    description: "Radial gradient with step()",
    component: ColorDisc,
  },
  {
    title: "Rotating Hello",
    description: "Shader composition",
    component: RotatingHello,
  },
  {
    title: "Motion Blur",
    description: "Backbuffering + composition",
    component: MotionBlurDemo,
  },
];

// -- App --

export default function App() {
  const [selected, setSelected] = useState(0);
  const Example = examples[selected].component;

  return (
    <SafeAreaView style={styles.container} testID="app-root">
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title} testID="app-title">gl-react cookbook</Text>
        <Text style={styles.subtitle} testID="example-description">{examples[selected].description}</Text>
      </View>

      <View style={styles.canvasContainer} testID="canvas-container">
        <Example />
      </View>

      <ScrollView
        horizontal
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
        showsHorizontalScrollIndicator={false}
        testID="tab-bar"
      >
        {examples.map((ex, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelected(i)}
            style={[styles.tab, i === selected && styles.tabActive]}
            testID={`tab-${ex.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Text
              style={[styles.tabText, i === selected && styles.tabTextActive]}
            >
              {ex.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  surface: {
    width: 300,
    height: 300,
  },
  tabBar: {
    maxHeight: 56,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  tabBarContent: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#333",
  },
  tabText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },
});
