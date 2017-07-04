import { loadAsset } from "./ExponentTextureLoader";

export default function GLImage() {
  if (!(this instanceof GLImage))
    throw new Error(
      "Failed to construct 'Image': Please use the 'new' operator."
    );
  this.onload = null;
  this._src = null;
}

GLImage.prototype = {
  //$FlowFixMe
  get src() {
    return this._src;
  },
  //$FlowFixMe
  set src(src) {
    if (this._src === src) return;
    delete this.localUri;
    this._src = src;

    if (src) {
      loadAsset(src).then(({ localUri }) => {
        this.localUri = localUri;
        if (this.onload) this.onload();
      });
    }
  }
};
