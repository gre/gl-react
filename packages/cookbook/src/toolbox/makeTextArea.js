//@flow
import React, { Component } from "react";

export default (style: any) =>
  class TextArea extends Component {
    props: {
      value: string,
      onChange: (c: string) => any,
    };
    onChange = (e: any) => this.props.onChange(e.target.value);
    render() {
      return (
        <textarea
          style={style}
          type="text"
          spellCheck="false"
          value={this.props.value}
          onChange={this.onChange}
        />
      );
    }
  };
