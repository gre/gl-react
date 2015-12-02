const React = require("./react-runtime");
const {
  Component,
  PropTypes
} = React;
const invariant = require("invariant");
const { fill, resolve, build } = require("./data");
const findGLNodeInGLComponentChildren = require("./data/findGLNodeInGLComponentChildren");

function logResult (data, contentsVDOM) {
  if (typeof console !== "undefined" &&
    console.debug // eslint-disable-line
  ) {
    console.debug("GL.Surface rendered with", data, contentsVDOM); // eslint-disable-line no-console
  }
}

module.exports = function (renderVcontainer, renderVcontent, renderVGL) {

  class GLSurface extends Component {
    constructor (props, context) {
      super(props, context);
      this._renderId = 1;
    }
    getGLCanvas () {
      return this.refs.canvas;
    }
    captureFrame (callback) {
      const c = this.getGLCanvas();
      invariant(c && c.captureFrame, "captureFrame() should be implemented by GLCanvas");
      invariant(typeof callback === "function", "captureFrame(cb) should have a callback function in first parameter");
      return c.captureFrame.call(c, callback);
    }
    render() {
      const renderId = this._renderId ++;
      const props = this.props;
      const {
        style,
        width,
        height,
        children,
        debug,
        preload,
        opaque,
        visibleContent,
        eventsThrough,
        ...restProps
      } = props;

      const { via, childGLNode } =
        findGLNodeInGLComponentChildren(children);

      invariant(childGLNode, "GL.Surface must have in children a GL.Node or a GL Component");

      const { data, contentsVDOM, imagesToPreload } =
        resolve(
          fill(
            build(
              childGLNode,
              width,
              height,
              preload,
              via)));

      if (debug) logResult(data, contentsVDOM);

      return renderVcontainer(
        { width, height, style, visibleContent, eventsThrough },
        contentsVDOM.map((vdom, i) =>
          renderVcontent(data.width, data.height, i, vdom, { visibleContent })),
        renderVGL({
          ...restProps, // eslint-disable-line no-undef
          width,
          height,
          data,
          nbContentTextures: contentsVDOM.length,
          imagesToPreload,
          renderId,
          opaque,
          visibleContent,
          eventsThrough
        })
      );
    }
  }

  GLSurface.displayName = "GL.Surface";

  GLSurface.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    children: PropTypes.element.isRequired,
    opaque: PropTypes.bool,
    preload: PropTypes.bool,
    autoRedraw: PropTypes.bool,
    eventsThrough: PropTypes.bool,
    visibleContent: PropTypes.bool,
    onLoad: PropTypes.func,
    onProgress: PropTypes.func
  };

  GLSurface.defaultProps = {
    opaque: true,
    preload: false,
    autoRedraw: false,
    eventsThrough: false,
    visibleContent: false
  };

  return GLSurface;
};
