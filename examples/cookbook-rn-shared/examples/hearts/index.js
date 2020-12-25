//@flow
import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, Dimensions } from "react-native";
import seedrandom from "seedrandom";
import { InteractiveHeart } from "../heart";

const { width: viewportWidth } = Dimensions.get("window");

const increment = 3;
const seed = "gl-react is awesome";

const genRows = (nb) => {
  const rows = [];
  const random = seedrandom(seed);
  for (let i = 0; i < nb; i++) {
    rows.push({
      color: [random(), random(), random()],
      image: { uri: "https://i.imgur.com/GQo1KWq.jpg" },
    });
  }
  return rows;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

const Example = () => {
  const [data, setData] = useState(() => genRows(increment));

  const more = useCallback(() => {
    setData(genRows(data.length + increment));
  }, [data]);

  return (
    <FlatList
      style={styles.container}
      onEndReached={more}
      data={data}
      renderItem={({ item }) => (
        <InteractiveHeart {...item} width={viewportWidth} />
      )}
    />
  );
};

export default Example;
