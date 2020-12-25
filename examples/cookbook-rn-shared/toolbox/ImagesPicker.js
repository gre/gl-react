//@flow
import React, { PureComponent, Component } from "react";
import { Image, View, TouchableOpacity } from "react-native";

class ImagePickable extends PureComponent {
  props: {
    style: any,
    src: *,
    selected: boolean,
    onChange: (src: *) => void,
  };
  onPress = () => this.props.onChange(this.props.src);
  render() {
    const { src, selected, style } = this.props;
    return (
      <TouchableOpacity onPress={this.onPress}>
        <Image
          source={src}
          onClick={this.onClick}
          style={{
            borderWidth: 2,
            borderColor: selected ? "#F00" : "transparent",
            ...style,
          }}
        />
      </TouchableOpacity>
    );
  }
}

export default class ImagesPicker extends Component {
  props: {
    imageStyle?: any,
    style?: any,
    value: Object,
    images: Array<Object>,
    onChange: (c: Object) => any,
  };
  render() {
    const { value, onChange, images, style, imageStyle } = this.props;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          flexWrap: "wrap",
          ...style,
        }}
      >
        {images.map((src, k) => (
          <ImagePickable
            key={k}
            onChange={onChange}
            src={src}
            selected={src === value}
            style={imageStyle}
          />
        ))}
      </View>
    );
  }
}
