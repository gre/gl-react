//@flow
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, .1)",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  id: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    margin: 2,
  },
  title: {
    fontSize: 16,
    color: "#222",
    margin: 2,
  },
  disabled: {
    opacity: 0.3,
  },
  description: {
    fontSize: 12,
    color: "#888",
    margin: 2,
  },
});

type Props = {
  id: string,
  title: string,
  description: string,
  onPress: Function,
  disabled?: boolean,
};

export default function ListItem({ id, title, description, onPress, disabled }: Props) {
  return (
    <TouchableOpacity style={[ styles.container, disabled ? styles.titleDisabled : null ]} onPress={onPress} disabled={disabled}>
      <View>
        <Text style={[styles.id]}>{id}</Text>
        <Text style={[styles.title]}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}
