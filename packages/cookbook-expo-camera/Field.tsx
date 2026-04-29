import React, { useCallback } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    width: 120,
    textAlign: "right",
    fontSize: 14,
  },
  value: {
    width: 80,
  },
  range: {
    flex: 1,
    height: 20,
    margin: 6,
  },
});

export default function Field({
  value,
  id,
  name,
  min,
  max,
  step,
  prettyPrint,
  onChange,
  onReset,
}: {
  value: number;
  id: string;
  name: string;
  min?: number;
  max?: number;
  step?: number;
  prettyPrint: (value: number) => string;
  onChange: (value: number, id: string) => void;
  onReset: (id: string) => void;
}) {
  const handleChange = useCallback(
    (v: number) => onChange(v, id),
    [onChange, id],
  );
  const handleReset = useCallback(() => onReset(id), [onReset, id]);

  return (
    <View style={styles.field}>
      <Pressable onPress={handleReset}>
        <Text style={styles.title}>{name}</Text>
      </Pressable>
      <Slider
        style={styles.range}
        minimumValue={min}
        maximumValue={max}
        step={step || 0.01}
        value={value}
        onValueChange={handleChange}
      />
      <Text style={styles.value}>{prettyPrint(value)}</Text>
    </View>
  );
}
