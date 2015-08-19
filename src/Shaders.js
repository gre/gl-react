const invariant = require("invariant");

let checkCompiles = () => {};

if (process.env.NODE_ENV !== "production") {
  const createShader = require("gl-shader");
  const vertexCode = require("./static.vert");

  // Since validation can be intensive, this is only done in dev mode
  const mockCanvas = document.createElement("canvas");
  const mockGl = (
    mockCanvas.getContext("webgl") ||
    mockCanvas.getContext("webgl-experimental") ||
    mockCanvas.getContext("experimental-webgl")
  );
  checkCompiles = o => {
    if (!mockGl) return; // we skip validation when webgl is not supported
    createShader(mockGl, vertexCode, o.frag).dispose();
  };
}

let _uid = 1;
const _shaders = {};

const Shaders = {
  create: function (obj) {
    invariant(typeof obj === "object", "config must be an object");
    const result = {};
    for (let key in obj) {
      const shader = obj[key];
      invariant(typeof shader === "object" && typeof shader.frag === "string",
      "invalid shader given to Shaders.create(). A valid shader is a { frag: String }");
      const id = _uid ++;
      try {
        checkCompiles(shader);
      }
      catch (e) {
        const err = new Error("Shader '"+key+"': "+e.message);
        err.stack = e.stack;
        err.name = e.name;
        err.original = e;
        throw err;
      }
      _shaders[id] = shader;
      result[key] = id;
    }
    return result;
  },
  get: function (id) {
    return _shaders[id];
  },
  exists: function (id) {
    return typeof id === "number" && id >= 1 && id < _uid;
  }
};

module.exports = Shaders;
