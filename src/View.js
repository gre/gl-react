const React = require("react");
const Shaders = require("./Shaders");
const Uniform = require("./Uniform");
const Component = require("./Component");
const GLCanvas = require("./GLCanvas");
const {createView} = require("gl-react-core");

const renderVcontent = function (width, height, id, children) {
  const content = React.Children.only(children);
  const childrenStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: width+"px",
    height: height+"px"
  };
  return <div key={"content-"+id} style={childrenStyle}>{content}</div>;
};

const renderVGL = function (props) {
  return <GLCanvas {...props} />;
};

const renderVcontainer = function (width, height, contents, renderer) {
  const parentStyle = {
    position: "relative",
    width: width+"px",
    height: height+"px",
    overflow: "hidden"
  };
  return <div style={parentStyle}>
    {contents}
    {renderer}
  </div>;
};

module.exports = createView(React, Shaders, Uniform, Component, renderVcontainer, renderVcontent, renderVGL);
