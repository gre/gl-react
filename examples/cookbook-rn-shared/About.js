import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Platform,
  Linking,
} from "react-native";
import { Surface, name } from "./gl-react-implementation";
import { Node, Shaders, GLSL, Uniform, LinearCopy } from "gl-react";
import timeLoop from "./HOC/timeLoop";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingVertical: 20,
    flexDirection: "column",
  },
  list: {
    flex: 1,
  },
  subHeader: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  subHeaderText: {
    color: "#333",
    fontSize: 12,
    fontStyle: "italic",
  },
  title: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  },
  ex1: {
    flexDirection: "column",
  },
  code: {
    backgroundColor: "transparent",
    color: "#282c34",
    fontFamily: Platform.select({
      android: "monospace",
      ios: "Courier New",
    }),
    fontSize: 9,
    padding: 8,
    width: 250,
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

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

const MotionBlur = ({ children, persistence }: *) => (
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
  render() {
    const { time } = this.props;
    const persistence = 0.75 - 0.2 * Math.cos(0.0005 * time);
    const red = 0.6 + 0.4 * Math.cos(0.004 * time);
    const scale = 0.7 + 0.4 * Math.cos(0.001 * time);
    const angle = 2 * Math.PI * (0.5 + 0.5 * Math.cos(0.001 * time));
    return (
      <View style={styles.ex1}>
        <Surface style={{ width: 250, height: 250 }}>
          <LinearCopy>
            <MotionBlur persistence={persistence}>
              <Rotate scale={scale} angle={angle}>
                <HelloGL red={red} />
              </Rotate>
            </MotionBlur>
          </LinearCopy>
        </Surface>
        <Text style={styles.code}>{`<Surface style={{width:250,height:250}}>
  <LinearCopy>
    <MotionBlur persistence={${persistence.toFixed(2)}}>
      <Rotate scale={${scale.toFixed(2)}} angle={${angle.toFixed(2)}}>
        <HelloGL red={${red.toFixed(1)}} />
      </Rotate>
    </MotionBlur>
  </LinearCopy>
</Surface>`}</Text>
      </View>
    );
  }
}

const Ex1Loop = timeLoop(Ex1);

class Link extends React.Component {
  render() {
    const { url } = this.props;
    return (
      <Text style={styles.link} onPress={() => Linking.openURL(url)}>
        {url}
      </Text>
    );
  }
}

export default class Home extends React.Component {
  static route = {
    navigationBar: {
      renderTitle: () => (
        <View style={styles.title}>
          <Text style={styles.titleText}>{name}</Text>
        </View>
      ),
    },
  };
  props: {
    navigation: *,
  };
  render() {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.container}>
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            a React Native library to write and compose WebGL shaders
          </Text>
          <View style={{ alignItems: "center", padding: 20 }}>
            <Ex1Loop />
          </View>
          <View>
            <Text style={styles.linkTitle}>Cookbook, web version:</Text>
            <Link url="https://gl-react-cookbook.surge.sh" />
          </View>
          <View>
            <Text style={styles.linkTitle}>Github:</Text>
            <Link url="https://github.com/gre/gl-react" />
          </View>
        </View>
      </ScrollView>
    );
  }
}
