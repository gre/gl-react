//@flow
import React, { Component } from "react";
import ImagesPicker from "./ImagesPicker";
const images = [
  { uri: "https://i.imgur.com/SzbbUvX.jpg" },
  { uri: "https://i.imgur.com/0PkQEk1.jpg" },
  { uri: "https://i.imgur.com/z2CQHpg.jpg" },
  { uri: "https://i.imgur.com/k9Eview.jpg" },
  { uri: "https://i.imgur.com/wh0On3P.jpg" },
];
export default class StaticBlurMap extends Component {
  static images = images;
  render() {
    return (
      <ImagesPicker
        {...this.props}
        imageStyle={{ width: 60, height: 60 }}
        images={images}
      />
    );
  }
}
