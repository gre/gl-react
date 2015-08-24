const React = require("react");
const Shaders = require("./Shaders");
const Target = require("./Target");
const GLCanvas = require("./GLCanvas");
const createView = require("./core/createView");


const renderVtarget = function (style, width, height, id, target) {
  const childrenStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: width+"px",
    height: height+"px",
    visibility: "hidden"
  };
  return <div key={"target-"+id} style={{ ...childrenStyle, ...style }}>{target}</div>;
};

const renderVGL = function (props, passes) {
  return <GLCanvas
    {...props}
    passes={passes}
  />;
};

const renderVcontainer = function (props, targets, renderer) {
  const { style, width, height } = props;
  if (targets) {
    const parentStyle = {
      ...style,
      position: "relative",
      width: width+"px",
      height: height+"px",
      overflow: "hidden"
    };
    return <div style={parentStyle}>
      {targets}
      {renderer}
    </div>;
  }
  else {
    return renderer;
  }
};

module.exports = createView(React, Shaders, Target, renderVcontainer, renderVtarget, renderVGL);
