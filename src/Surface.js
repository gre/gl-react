const React = require("react");
const GLCanvas = require("./GLCanvas");
const {createSurface} = require("gl-react-core");
const pointerEventsProperty = require("./pointerEventsProperty");

function renderVcontent (width, height, id, children, { visibleContent }) {
  const content = React.Children.only(children);
  const childrenStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: width+"px",
    height: height+"px",
    visibility: visibleContent ? "visible" : "hidden"
  };
  return <div key={"content-"+id} style={childrenStyle}>{content}</div>;
}

function renderVGL (props) {
  return <GLCanvas ref="canvas" {...props} />;
}

function renderVcontainer ({ style, visibleContent, eventsThrough, width, height }, contents, renderer) {
  const parentStyle = {
    position: "relative",
    ...style,
    width: width+"px",
    height: height+"px",
    overflow: "hidden",
    [pointerEventsProperty]: !visibleContent && eventsThrough ? "none" : "auto"
  };
  return <div style={parentStyle}>
    {contents}
    {renderer}
  </div>;
}

module.exports = createSurface(renderVcontainer, renderVcontent, renderVGL);
