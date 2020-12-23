//@flow
import React, { PureComponent, Component } from "react";

class ImagePickable extends PureComponent {
  props: {
    style: any,
    src: string,
    selected: boolean,
    onChange: (src: string) => void,
  };
  onClick = () => this.props.onChange(this.props.src);
  render() {
    const { src, selected, style } = this.props;
    return (
      <img
        alt=""
        src={src}
        onClick={this.onClick}
        style={{
          borderWidth: 2,
          borderColor: selected ? "#F00" : "transparent",
          borderStyle: "solid",
          ...style,
        }}
      />
    );
  }
}

export default class ImagesPicker extends Component {
  props: {
    imageStyle?: any,
    style?: any,
    value: string,
    images: Array<string>,
    onChange: (c: string) => any,
  };
  render() {
    const { value, onChange, images, style, imageStyle } = this.props;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
          ...style,
        }}
      >
        {images.map((src) => (
          <ImagePickable
            key={src}
            onChange={onChange}
            src={src}
            selected={src === value}
            style={imageStyle}
          />
        ))}
      </div>
    );
  }
}
