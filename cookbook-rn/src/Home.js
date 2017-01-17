
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
} from "react-native";
import ListItem from "./ListItem";
import * as examples from "./examples";
import Router from "./Router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  titleImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  titleText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  },
});

export default class Home extends React.Component {
  static route = {
    navigationBar: {
      renderTitle: () =>
        <View style={styles.title}>
          <Text style={styles.titleText}>gl-react-native</Text>
        </View>
    },
  };
  props: {
    navigator: *,
  };
  render() {
    const {navigator} = this.props;
    return (
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>
            a React Native library to write and compose WebGL shaders
          </Text>
          <View style={{ alignItems: "center", padding: 20 /* TMP it will be the home demo */ }}>
            <Image
              source={require("./logo.png")}
              style={{ width: 200, height: 200 }}
            />
          </View>
          <Text style={styles.subHeaderText}>
            Here is a collection of gl-react-native examples:
          </Text>
        </View>
        <View style={styles.list}>
          {Object.keys(examples).map(ex => {
            const { title, description, Example } = examples[ex];
            return <ListItem
              key={ex}
              id={ex}
              title={title}
              description={description||""}
              disabled={!Example}
              onPress={
                Example
                ? () => navigator.push(Router.getRoute(ex))
                : null
              }
            />;
          })}
        </View>
      </ScrollView>
    );
  }
}
