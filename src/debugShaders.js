
const { Shaders } = require("gl-react-core");

const createShader = require("gl-shader");
const vertexCode = require("./static.vert");

// Since validation can be intensive, this is only done in dev mode
const mockCanvas = document.createElement("canvas");
const mockGl = (
  mockCanvas.getContext("webgl") ||
  mockCanvas.getContext("webgl-experimental") ||
  mockCanvas.getContext("experimental-webgl")
);

const checkCompiles = o => {
  if (!mockGl) return; // we skip validation when webgl is not supported
  createShader(mockGl, vertexCode, o.frag).dispose();
};

Shaders.on("add", (id, shader) => {
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
});
