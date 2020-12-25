//@flow
import React, { Component } from "react";
import { TextInput } from "react-native";

export default (style: any) =>
  class TextArea extends Component {
    props: {
      value: string,
      onChange: (c: string) => any,
    };
    render() {
      const { onChange, value } = this.props;
      return (
        <TextInput
          style={style}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChange}
        />
      );
    }
  };
