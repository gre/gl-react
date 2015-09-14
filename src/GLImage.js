const createTexture = require("gl-texture2d");

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

function GLImage (gl, onload) {
  this.gl = gl;
  this.image = null;
  this._onload = onload;

  this.texture = createTexture(gl, [ 2, 2 ]);
  this.texture.minFilter = this.texture.magFilter = gl.LINEAR;
  this._textureImg = null;
}
GLImage.prototype = {
  dispose: function () {
    if (this._loading) this._loading();
    this.texture.dispose();
    this.texture = null;
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
        if (this._onload) this._onload(src);
      }, () => {
        this._loading = null;
        this.clearImage();
      });
    }
  },
  getTexture: function () {
    const image = this.image;
    const texture = this.texture;
    if (image !== this._textureImg) {
      this._textureImg = image;
      if (image) {
        texture.shape = [ image.width, image.height ];
        texture.setPixels(image);
      }
      else {
        texture.shape = [ 2, 2 ];
      }
    }
    return texture;
  },
  clearImage: function () {
    this.image = null;
  }
};
Object.defineProperty(GLImage.prototype, "src", {
  set: function (src) {
    if (src === this._src) return;
    this._src = src;
    this.reloadImage();
  },
  get: function () {
    return this._src;
  }
});

module.exports = GLImage;
