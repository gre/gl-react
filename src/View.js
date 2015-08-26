const React = require("react");
const Shaders = require("./Shaders");
const Target = require("./Target");
const Component = require("./Component");
const GLCanvas = require("./GLCanvas");
const {createView} = require("gl-react-core");

const renderVtarget = function (style, width, height, id, children) {
  const target = React.Children.only(children);
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

const renderVGL = function (props, width, height, data, nbTargets) {
  return <GLCanvas
    {...props}
    width={width}
    height={height}
    data={data}
    nbTargets={nbTargets}
  />;
};

const renderVcontainer = function (style, width, height, targets, renderer) {
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
};

module.exports = createView(React, Shaders, Target, Component, renderVcontainer, renderVtarget, renderVGL);
