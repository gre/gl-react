//@flow
import React, { Component } from "react";
import { Picker } from "react-native";

const styles = {
  root: {
    flex: 1,
  },
};

export default (choices: Array<{ key: string, label: string }>) =>
  class Select extends Component {
    props: {
      value: string,
      onChange: (c: string) => any,
    };
    render() {
      const { value, onChange } = this.props;
      return (
        <Picker
          style={styles.root}
          selectedValue={value}
          onValueChange={onChange}
        >
          {choices.map(({ key, label }) => (
            <Picker.Item key={key} value={key} label={label} />
          ))}
        </Picker>
      );
    }
  };
