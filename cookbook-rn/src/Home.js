
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Button,
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
    paddingVertical: 40,
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
});

export default class Home extends Component {
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
          <Button
            onPress={() => navigator.push(Router.getRoute("about"))}
            color="#e24"
            title="You said gl-react ?"
          />
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
