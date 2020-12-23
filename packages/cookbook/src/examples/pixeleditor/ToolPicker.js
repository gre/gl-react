//@flow
import React, { PureComponent } from "react";

class Tool extends PureComponent {
  props: {
    id: string,
    selected: boolean,
    onChange: (key: string) => void,
  };
  onClick = () => this.props.onChange(this.props.id);
  render() {
    const { id, selected } = this.props;
    return (
      <div
        onClick={this.onClick}
        className={id + " " + (selected ? "selected" : "")}
      />
    );
  }
}

export default class ToolPicker extends PureComponent {
  render() {
    const { tools, value, onChange } = this.props;
    return (
      <div className="tools">
        {Object.keys(tools).map((key) => (
          <Tool
            key={key}
            id={key}
            selected={key === value}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }
}
