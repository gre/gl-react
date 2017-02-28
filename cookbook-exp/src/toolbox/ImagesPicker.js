//@flow
import React, { PureComponent, Component } from "react";
import { Image, View, TouchableOpacity } from "react-native";

class ImagePickable extends PureComponent {
  props: {
    style: any,
    src: *,
    selected: boolean,
    onChange: (src: *)=>void,
  };
  onPress = () => this.props.onChange(this.props.src);
  render() {
    const { src, selected, style } = this.props;
    return <TouchableOpacity onPress={this.onPress}>
      <Image
        source={src}
        onClick={this.onClick}
        style={{
          borderWidth: 2,
          borderColor: selected ? "#F00" : "transparent",
          ...style,
        }}
      />
    </TouchableOpacity>;
  }
}

export default class ImagesPicker extends Component {
  props: {
    imageStyle?: any,
    style?: any,
    value: string,
    images: Array<string>,
    onChange: (c: string)=>any,
  };
  render() {
    const {value, onChange, images, style, imageStyle} = this.props;
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        flexWrap: "wrap",
        ...style,
      }}>
      {images.map(src =>
        <ImagePickable
          key={src}
          onChange={onChange}
          src={src}
          selected={src===value}
          style={imageStyle}
        />)}
      </View>
    );
  }
}
