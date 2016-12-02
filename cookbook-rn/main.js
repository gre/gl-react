import Exponent from "exponent";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import HelloGL from "./HelloGL";
import HelloTexture from "./HelloTexture";

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <HelloGL />
        <HelloTexture />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
});

Exponent.registerRootComponent(App);
