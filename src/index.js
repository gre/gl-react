const React = require("react");
const createComponent = require("./createComponent");
const createSurface = require("./createSurface");
const Node = require("./Node");
const Shaders = require("./Shaders");
const Uniform = require("./Uniform");

module.exports = {
  get React () { // this is to smoothly deprecate exposing React from past versions
    console.error("gl-react: `GL.React` is deprecated. Please directly imp"+"ort React from \"react\" instead.");
    return React;
  },
  createComponent,
  createSurface,
  Node,
  Shaders,
  Uniform
};
