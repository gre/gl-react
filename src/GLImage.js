const invariant = require("invariant");

function loadImage (src, success, failure) {
  var img = new window.Image();
  img.crossOrigin = true;
  img.onload = function () {
    success(img);
  };
  img.onabort = img.onerror = failure;
  img.src = src;
  return function () {
    img.onload = null;
    img.onerror = null;
    img.onabort = null;
    img.src = "";
    img = null;
  };
}

function GLImage (onload) {
  this.image = null;
  this._onload = onload;
}
GLImage.prototype = {
  dispose: function () {
    if (this._loading) this._loading();
  },
  reloadImage: function () {
    const src = this._src;
    if (this._loading) this._loading();
    this._loading = null;
    if (!src) {
      this.clearImage();
    }
    else {
      this._loading = loadImage(src, img => {
        this.clearImage();
        this._loading = null;
        this.image = img;
        if (this._onload) this._onload();
      }, () => {
        this._loading = null;
        this.clearImage();
      });
    }
  },
  clearImage: function () {
    this.image = null;
  }
};
Object.defineProperty(GLImage.prototype, "src", {
  set: function (src) {
    if (src && typeof src === "object") {
      invariant("uri" in src, "GLImage: when using an object, it must have an 'uri' field");
      src = src.uri;
    }
    if (src === this._src) return;
    this._src = src;
    this.reloadImage();
  },
  get: function () {
    return this._src;
  }
});

module.exports = GLImage;
