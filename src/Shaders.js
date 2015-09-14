const {createShaders} = require("gl-react-core");

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

// In gl-react case, shaders are stored client side too. a get(id) function is exposed.
const _shaders = {};

const base = createShaders(function (id, shader) {
  try {
    checkCompiles(shader);
  }
  catch (e) {
    const err = new Error("Shader '"+shader.name+"': "+e.message);
    err.stack = e.stack;
    err.name = e.name;
    err.original = e;
    throw err;
  }
  _shaders[id] = shader;
});

module.exports = {
  ...base,
  get: function (id) {
    return _shaders[id];
  }
};
