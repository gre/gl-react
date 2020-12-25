//@flow
import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Text,
} from "react-native";
import * as Permissions from "expo-permissions";
import { Surface } from "gl-react-expo";
import GLCamera from "./GLCamera";
import Effects from "./Effects";
import Field from "./Field";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const percentagePrint = (v) => (v * 100).toFixed(0) + "%";
const radiantPrint = (r) => ((180 * r) / Math.PI).toFixed(0) + "°";

// prettier-ignore
const fields = [
  { id: "blur", name: "Blur", min: 0, max: 6, step: 0.1, prettyPrint: blur => blur.toFixed(1) },
  { id: "contrast", name: "Contrast", min: 0, max: 4, step: 0.1, prettyPrint: percentagePrint },
  { id: "brightness", name: "Brightness", min: 0, max: 4, step: 0.1, prettyPrint: percentagePrint },
  { id: "saturation", name: "Saturation", min: 0, max: 10, step: 0.1, prettyPrint: percentagePrint },
  { id: "hue", name: "HueRotate", min: 0, max: 2 * Math.PI, step: 0.1, prettyPrint: radiantPrint },
  { id: "negative", name: "Negative", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint },
  { id: "sepia", name: "Sepia", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint },
  { id: "flyeye", name: "FlyEye", min: 0, max: 1, step: 0.05, prettyPrint: percentagePrint }
];

const initialEffectsState = {
  blur: 0,
  saturation: 1,
  contrast: 1,
  brightness: 1,
  negative: 0,
  hue: 0,
  sepia: 0,
  flyeye: 0,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEE",
  },
  surface: {
    width: windowWidth * 0.75,
    height: windowWidth,
    alignSelf: "center",
  },
  fields: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#EEE",
  },
});

export default class App extends Component<*, *> {
  state = {
    position: "front",
    effects: initialEffectsState,
    permission: null,
  };

  async componentDidMount() {
    const permission = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permission });
  }

  onSurfacePress = () => {
    this.setState(({ position }) => ({
      position: position === "front" ? "back" : "front",
    }));
  };

  onEffectChange = (value: *, id: *) => {
    this.setState(({ effects }) => ({
      effects: { ...effects, [id]: value },
    }));
  };

  onEffectReset = (id: *) => {
    this.setState(({ effects }) => ({
      effects: { ...effects, [id]: initialEffectsState[id] },
    }));
  };

  render() {
    const { position, effects, permission } = this.state;
    return (
      <ScrollView bounces={false} style={styles.root}>
        {permission ? (
          permission.status === "granted" ? (
            <TouchableOpacity onPress={this.onSurfacePress}>
              <Surface style={styles.surface}>
                <Effects {...effects}>
                  <GLCamera position={position} />
                </Effects>
              </Surface>
            </TouchableOpacity>
          ) : (
            <Text style={{ padding: 100 }}>Camera permission denied</Text>
          )
        ) : (
          <Text style={{ padding: 100 }}>Loading...</Text>
        )}

        <View style={styles.fields}>
          {fields.map(({ id, ...props }) => (
            <Field
              {...props}
              key={id}
              id={id}
              value={effects[id]}
              onChange={this.onEffectChange}
              onReset={this.onEffectReset}
            />
          ))}
        </View>
      </ScrollView>
    );
  }
}
