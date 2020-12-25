//@flow
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, .1)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    margin: 2,
  },
  description: {
    fontSize: 12,
    color: "#888",
    margin: 2,
  },
});

export default class Item extends React.PureComponent {
  props: {
    navigation: *,
    id: string,
    title: string,
    description: ?string,
    thumbnail: ?string,
  };

  onPress = () => this.props.navigation.navigate(this.props.id);

  render() {
    const {
      id,
      title,
      description,
      disabled,
      thumbnail,
      navigation,
    } = this.props;
    return (
      <TouchableOpacity style={styles.container} onPress={this.onPress}>
        {thumbnail ? (
          <Image style={styles.thumbnail} source={thumbnail} />
        ) : null}
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
