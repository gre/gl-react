//@flow
import React, { Component } from "react";
import { StyleSheet, ListView, Dimensions } from "react-native";
import seedrandom from "seedrandom";
const { width: viewportWidth } = Dimensions.get("window");
import { InteractiveHeart } from "../heart";

const sameColor = ([r,g,b], [R,G,B]) =>
  r===R && g===G && b===B;

const rowHasChanged = (r1, r2) =>
  !sameColor(r1.color, r2.color);

const increment = 3;
const seed = "gl-react is awesome";

const genRows = nb => {
  const rows = [];
  const random = seedrandom(seed);
  for (let i = 0; i < nb; i++) {
    rows.push({
      color: [ random(), random(), random() ],
      image: { uri: "https://i.imgur.com/GQo1KWq.jpg" },
    });
  }
  return rows;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  }
});

export default class Example extends Component {
  state = {
    dataSource: new ListView.DataSource({
      rowHasChanged
    }).cloneWithRows(genRows(increment))
  };
  more = () => {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.cloneWithRows(
        genRows(increment + dataSource.getRowCount())
      )
    });
  };
  render () {
    return (
      <ListView
        style={styles.container}
        dataSource={this.state.dataSource}
        onEndReached={this.more}
        renderRow={row =>
          <InteractiveHeart
            {...row}
            width={viewportWidth}
          />}
      />
    );
  }
}
