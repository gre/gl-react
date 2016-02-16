const React = require("react");
const {
  Component,
  PropTypes
} = React;
const invariant = require("invariant");
const { fill, resolve, build } = require("./data");
const Shaders = require("./Shaders");
const Node = require("./Node");
const postShader = require("./postShader");
const findGLNodeInGLComponentChildren = require("./data/findGLNodeInGLComponentChildren");
const invariantStrictPositive = require("./data/invariantStrictPositive");
const AnimatedData = require("./AnimatedData");

let _glSurfaceId = 1;

function logResult (data, contentsVDOM) {
  if (typeof console !== "undefined" &&
    console.debug // eslint-disable-line
  ) {
    console.debug("GL.Surface rendered with", data, contentsVDOM); // eslint-disable-line no-console
  }
}

module.exports = (
  renderVcontainer,
  renderVcontent,
  renderVGL,
  getPixelRatio
) => {

  class GLSurface extends Component {
    constructor (props, context) {
      super(props, context);
      this._renderId = 0;
      this._id = _glSurfaceId ++;
    }

    componentWillMount () {
      Shaders._onSurfaceWillMount(this._id);
      this._build(this.props);
      this._attach();
    }

    componentWillUnmount () {
      this._renderId = 0;
      Shaders._onSurfaceWillUnmount(this._id);
      this._dataAnimated && this._dataAnimated.__detach();
    }

    componentWillReceiveProps (nextProps) {
      this._build(nextProps);
      this._attach();
    }

    _build (props) {
      const id = this._id;
      const renderId = ++this._renderId;
      const {
        width,
        height,
        pixelRatio: pixelRatioProps,
        children,
        debug,
        preload
      } = props;

      invariant(children, "GL.Surface must have in children a GL.Node or a GL Component");

      const decorateOnShaderCompile = onShaderCompile =>
      onShaderCompile && // only decorated if onShaderCompile is defined
      ((error, result) =>
        renderId === this._renderId && // it's outdated. skip the callback call
        onShaderCompile(error, result)); // it's current. propagate the call

      const pixelRatio = pixelRatioProps || getPixelRatio(props);

      invariantStrictPositive(pixelRatio, "GL.Surface: pixelRatio prop");
      invariantStrictPositive(width, "GL.Surface: width prop");
      invariantStrictPositive(height, "GL.Surface: height prop");

      const surfaceContext = {
        width,
        height,
        pixelRatio
      };

      const glNode = findGLNodeInGLComponentChildren(
        <Node
          shader={postShader}
          {...surfaceContext}
          uniforms={{ t: children }}
        />,
        surfaceContext);

      invariant(glNode && glNode.childGLNode, "GL.Surface must have in children a GL.Node or a GL Component");

      const { via, childGLNode, context } = glNode;

      let resolved;
      try {
        Shaders._beforeSurfaceBuild(id);
        resolved =
          resolve(
            fill(
              build(
                childGLNode,
                context,
                preload,
                via,
                id,
                decorateOnShaderCompile
              )));
      }
      catch (e) {
        throw e;
      }
      finally {
        Shaders._afterSurfaceBuild(id);
      }

      this._resolved = resolved;
      this._pixelRatio = pixelRatio;

      if (debug) logResult(resolved.data, resolved.contentsVDOM);
    }

    _attach () {
      const oldDataAnimated = this._dataAnimated;
      const callback = () => {
        const canvas = this.getGLCanvas();
        if (!canvas) return;
        if (canvas.setNativeProps) {
          const data = this._dataAnimated.__getValue();
          canvas.setNativeProps({ data });
        }
        else {
          this.forceUpdate();
        }
      };
      this._dataAnimated = new AnimatedData(
        this._resolved.data,
        callback);

      oldDataAnimated && oldDataAnimated.__detach();
    }

    getGLCanvas () {
      return this.refs.canvas;
    }

    captureFrame () {
      const c = this.getGLCanvas();
      invariant(c, "c is '%s'. Is the component unmounted?", c);
      invariant(c.captureFrame, "captureFrame() should be implemented by GLCanvas");
      return c.captureFrame.apply(c, arguments);
    }

    render() {
      const renderId = this._renderId;
      const { contentsVDOM, imagesToPreload } = this._resolved;
      const data = this._dataAnimated.__getValue();
      const pixelRatio = this._pixelRatio;
      const props = this.props;
      const {
        style,
        width,
        height,
        backgroundColor,
        children,
        debug,
        preload,
        visibleContent,
        eventsThrough,
        ...restProps
      } = props;

      return renderVcontainer(
        { width, height, style, visibleContent, eventsThrough },
        contentsVDOM.map((vdom, i) =>
          renderVcontent(data.width, data.height, i, vdom, { visibleContent })),
        renderVGL({
          ...restProps, // eslint-disable-line no-undef
          style: { backgroundColor },
          width,
          height,
          pixelRatio,
          data,
          nbContentTextures: contentsVDOM.length,
          imagesToPreload,
          renderId,
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
    backgroundColor: PropTypes.string,
    pixelRatio: PropTypes.number,
    children: PropTypes.element.isRequired,
    preload: PropTypes.bool,
    autoRedraw: PropTypes.bool,
    eventsThrough: PropTypes.bool,
    visibleContent: PropTypes.bool,
    onLoad: PropTypes.func,
    onProgress: PropTypes.func
  };

  GLSurface.defaultProps = {
    preload: false,
    autoRedraw: false,
    eventsThrough: false,
    visibleContent: false,
    backgroundColor: "#000"
  };

  return GLSurface;
};
