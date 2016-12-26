//@flow
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, .1)",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    margin: 2,
  },
  titleDisabled: {
    color: "#aaa",
  },
  description: {
    fontSize: 12,
    color: "#888",
    margin: 2,
  },
});

type Props = {
  title: string,
  description: string,
  onPress: Function,
  disabled?: boolean,
};

export default function ListItem({ title, description, onPress, disabled }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={disabled}>
      <Text style={[styles.title, disabled ? styles.titleDisabled : null ]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}
