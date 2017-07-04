//@flow
import GLImages from "./GLImages";

// This is a window.Image polyfill implementation that works with WebGL implementation. (can be provided to gl.texImage2D 6-args version)
export default function GLImage() {
  if (!(this instanceof GLImage))
    throw new Error(
      "Failed to construct 'Image': Please use the 'new' operator."
    );
  this.onload = null;
  this._src = null;
  this.glAssetId = null;
}

GLImage.prototype = {
  //$FlowFixMe
  get src() {
    return this._src;
  },
  //$FlowFixMe
  set src(src) {
    if (this._src === src) return;
    this.glAssetId = null;
    this._src = src;
    if (src) {
      GLImages.load(src).then(glAssetId => {
        this.glAssetId = glAssetId;
        if (this.onload) this.onload();
      });
    }
  }
};
