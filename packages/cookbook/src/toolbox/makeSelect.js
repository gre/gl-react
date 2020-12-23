//@flow
import React, { Component } from "react";

const styles = {
  root: {
    display: "flex",
    flexDirection: "row",
  },
  select: {
    flex: 1,
  },
  random: {},
};

export default (choices: Array<{ key: string, label: string }>) =>
  class Radios extends Component {
    props: {
      value: string,
      onChange: (c: string) => any,
    };
    onChange = (e: any) => this.props.onChange(e.target.value);
    random = () =>
      this.props.onChange(
        choices[Math.floor(Math.random() * choices.length)].key
      );
    prev = () => {
      const keys = choices.map((c) => c.key);
      const index = keys.indexOf(this.props.value);
      this.props.onChange(keys[(index + keys.length - 1) % keys.length]);
    };
    next = () => {
      const keys = choices.map((c) => c.key);
      const index = keys.indexOf(this.props.value);
      this.props.onChange(keys[(index + 1) % keys.length]);
    };
    render() {
      const { value } = this.props;
      return (
        <div style={styles.root}>
          <button style={styles.random} onClick={this.prev}>
            ←
          </button>
          <select style={styles.select} value={value} onChange={this.onChange}>
            {choices.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button style={styles.random} onClick={this.next}>
            →
          </button>
        </div>
      );
    }
  };
