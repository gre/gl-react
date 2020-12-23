//@flow
import React, { Component } from "react";

export default (choices: Array<{ key: string, label: string }>) =>
  class Radios extends Component {
    props: {
      prop: string,
      value: string,
      onChange: (c: string) => any,
    };
    onChange = (e: any) => this.props.onChange(e.target.value);
    render() {
      const { value, prop } = this.props;
      return (
        <div style={{ display: "flex", flexDirection: "row" }}>
          {choices.map(({ key, label }) => (
            <label style={{ flex: 1 }} key={label}>
              <input
                type="radio"
                name={prop}
                value={key}
                onChange={this.onChange}
                checked={key === value}
              />
              {label}
            </label>
          ))}
        </div>
      );
    }
  };
