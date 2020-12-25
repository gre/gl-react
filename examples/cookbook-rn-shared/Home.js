import React, { Component } from "react";
import { StyleSheet, Text, ScrollView, View, Button } from "react-native";
import { name } from "./gl-react-implementation";
import Item from "./Item";
import * as examples from "./examples";
import * as tests from "./tests";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    flexDirection: "column",
  },
  list: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 50,
  },
  subHeader: {
    padding: 10,
    paddingVertical: 40,
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
  sectionTitle: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 18,
    padding: 10,
  },
});

export default class Home extends Component {
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
    const { navigation } = this.props;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.subHeader}>
          <Button
            onPress={() => navigation.navigate("about")}
            color="#e24"
            title="What is gl-react ?"
          />
        </View>
        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Examples</Text>
          {Object.keys(examples).map((ex) => (
            <Item key={ex} id={ex} navigation={navigation} {...examples[ex]} />
          ))}
        </View>
        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Tests</Text>
          {Object.keys(tests).map((ex) => (
            <Item key={ex} id={ex} navigation={navigation} {...tests[ex]} />
          ))}
        </View>
      </ScrollView>
    );
  }
}
