//@flow
import React, { Component } from "react";
import ImagesPicker from "./ImagesPicker";

const imgurify = (slugs) =>
  slugs.split(",").map((id) => "https://i.imgur.com/" + id + ".png");
const images = imgurify("SzbbUvX,0PkQEk1,z2CQHpg,k9Eview,wh0On3P");

export default class StaticBlurMap extends Component {
  static images = images;

  render() {
    return (
      <ImagesPicker
        {...this.props}
        imageStyle={{ width: 80 }}
        images={images}
      />
    );
  }
}
