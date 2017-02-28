//@flow
import React, { Component } from "react";
import ImagesPicker from "./ImagesPicker";
const images = [
  require("../SzbbUvX.jpg"),
  require("../0PkQEk1.jpg"),
  require("../z2CQHpg.jpg"),
  require("../k9Eview.jpg"),
  require("../wh0On3P.jpg"),
];
export default class StaticBlurMap extends Component {
  static images = images;
  render() {
    return <ImagesPicker
      {...this.props}
      imageStyle={{ width: 60, height: 60 }}
      images={images}
    />;
  }
}
