//@flow
import invariant from "invariant";
import React, { Component } from "react";
import PropTypes from "prop-types";
import createShader from "gl-shader";
import Bus from "./Bus";
import Shaders from "./Shaders";
import Visitors from "./Visitors";
import { LoaderResolver } from "webgltexture-loader";
import type { NDArray } from "ndarray";
import type { ShaderIdentifier, ShaderInfo } from "./Shaders";
import type { Shader } from "gl-shader";
import type { VisitorLike } from "./Visitor";
import type { WebGLTextureLoader } from "webgltexture-loader";
import type Node from "./Node";

const __DEV__ = process.env.NODE_ENV === "development";

const prependGLSLName = (glsl: string, name: ?string) =>
  !name ? glsl : "#define SHADER_NAME " + name + "\n" + glsl;

type SurfaceProps = {
  children?: any,
  style?: Object,
  preload?: Array<mixed>,
  onLoad?: () => void,
  onLoadError?: (e: Error) => void,
  onContextLost?: () => void,
  onContextRestored?: () => void,
  visitor?: VisitorLike,
};

interface ISurface extends Component<SurfaceProps, *> {
  props: SurfaceProps;
  gl: ?WebGLRenderingContext;
  RenderLessElement: React$ComponentType<*>;
  root: ?Node;
  id: number;

  +mapRenderableContent: ?(inst: mixed) => mixed;
  +getVisitors: () => Array<VisitorLike>;
  +getGLSize: () => [number, number];
  +getGLName: () => string;
  +getGLShortName: () => string;
  +captureAsDataURL: (...args: any) => string;
  +captureAsBlob: (...args: any) => Promise<Blob>;
  +capture: (x?: number, y?: number, w?: number, h?: number) => NDArray;
  +redraw: () => void;
  +flush: () => void;
  +getEmptyTexture: () => WebGLTexture;
  +glIsAvailable: () => boolean;

  +rebootForDebug: () => void;
  +_addGLNodeChild: (node: Node) => void;
  +_removeGLNodeChild: (node: Node) => void;
  +_resolveTextureLoader: (
    raw: any
  ) => { loader: ?WebGLTextureLoader<*>, input: mixed };
  +_getShader: (shaderId: ShaderIdentifier) => Shader;
  +_makeShader: (shaderInfo: ShaderInfo) => Shader;
  +_draw: () => void;
  +_bindRootNode: () => void;
}

export type Surface = ISurface;

export type SurfaceContext = {
  glParent: Node | Surface | Bus,
  glSurface: Surface,
  glSizable: { +getGLSize: () => [number, number] },
};

const SurfacePropTypes = {
  children: PropTypes.any.isRequired,
  style: PropTypes.any,
  preload: PropTypes.array,
  onLoad: PropTypes.func,
  onLoadError: PropTypes.func,
  onContextLost: PropTypes.func,
  onContextRestored: PropTypes.func,
  visitor: PropTypes.object,
};

let surfaceId = 0;
const _instances: Array<ISurface> = [];
export const list = (): Array<ISurface> => _instances.slice(0);

const allSurfaceProps = Object.keys(SurfacePropTypes);

type SurfaceOpts = {
  GLView: *,
  RenderLessElement: React$ComponentType<*>,
  mapRenderableContent?: (instance: mixed) => mixed,
  requestFrame: (f: Function) => number,
  cancelFrame: (id: number) => void,
};

export default ({
  GLView,
  RenderLessElement,
  mapRenderableContent,
  requestFrame,
  cancelFrame,
}: SurfaceOpts): Class<ISurface> => {
  /**
   * **Renders the final tree of [Node](#node) in a WebGL Canvas / OpenGLView /...**
   *
   * `<Surface>` performs the final GL draws for a given implementation.
   *
   * `width` and `height` props are required for `gl-react-dom` and `gl-react-headless`, but are not supported for React Native, where the paradigm is to use `style` (and either use flexbox or set a width/height from there).
   *
   * > Surface is the only component that isn't "universal",
   * therefore **Surface is exposed by the platform implementation**
   * (`gl-react-dom` / `gl-react-native` / ...),
   * unlike the rest of the API exposed through `gl-react`.
   * Each platform have its own implementation but most props are shared.
   * If you write a gl-react library, you shouldn't use `<Surface>` but only
   * let the final user doing it. Therefore your code should remain platform-independant.
   *
   * @class Surface
   * @extends Component
   * @prop {any} children - a tree of React Element that renders some [Node](#node) and/or [Bus](#bus).
   * @prop {number} [width] **(only for DOM)** - width of the Surface. multiplied by `pixelRatio` for the actual canvas pixel size.
   * @prop {number} [height] **(only for DOM)** - height of the Surface. multiplied by `pixelRatio` for the actual canvas pixel size.
   * @prop {object} [style] - CSS styles that get passed to the underlying `<canvas/>` or `<View/>`
   * @prop {Array<any>} [preload] - an array of things to preload before the Surface start rendering. Help avoiding blinks and providing required textures to render an initial state.
   * @prop {function} [onLoad] - a callback called when Surface is ready and just after it rendered.
   * @prop {function(error:Error):void} [onLoadError] - a callback called when the Surface was not able to load initially.
   * @prop {function} [onContextLost] - a callback called when the Surface context was lost.
   * @prop {function} [onContextRestored] - a callback called when the Surface was restored and ready.
   * @prop {Visitor} [visitor] - an internal visitor used for logs and tests.
   *
   * @prop {WebGLContextAttributes} [webglContextAttributes] **(gl-react-dom only)** a optional set of attributes to init WebGL with.
   * @prop {number} [pixelRatio=window.devicePixelRatio] **(gl-react-dom only)** allows to override the pixelRatio. (default `devicePixelRatio`)
   *
   * @example
   *
   *  <Surface width={300} height={200}>
   *    <Node shader={shaders.helloGL} />
   *  </Surface>
   *
   * @example
   *
   *  <Surface width={200} height={100}>
   *    <HelloGL />
   *  </Surface>
   *
   * @example
   *
   *  <Surface width={200} height={100}>
   *    <Blur factor={2}>
   *      <Negative>
   *        https://i.imgur.com/wxqlQkh.jpg
   *      </Negative>
   *    </Blur>
   *  </Surface>
   */
  return class Surface extends Component<
    SurfaceProps,
    {
      ready: boolean,
      rebootId: number,
      debug: boolean,
    }
  > {
    id: number = ++surfaceId;
    gl: ?WebGLRenderingContext;
    buffer: WebGLBuffer;
    loaderResolver: ?LoaderResolver;
    glView: *;
    root: ?Node;
    shaders: { [key: string]: Shader } = {};
    _preparingGL: Array<*> = [];
    _needsRedraw: boolean = false;
    state = {
      ready: false,
      rebootId: 0,
      debug: false,
    };

    RenderLessElement = RenderLessElement;
    mapRenderableContent = mapRenderableContent;

    static propTypes = SurfacePropTypes;
    static childContextTypes: { [_: $Keys<SurfaceContext>]: any } = {
      glSurface: PropTypes.object.isRequired,
      glParent: PropTypes.object.isRequired,
      glSizable: PropTypes.object.isRequired,
    };

    getChildContext(): SurfaceContext {
      return {
        glParent: this,
        glSurface: this,
        glSizable: this,
      };
    }

    componentDidMount() {
      _instances.push(this);
      this.getVisitors().forEach((v) => v.onSurfaceMount(this));
    }

    componentWillUnmount() {
      this._stopLoop();
      this._destroyGL();
      const i = _instances.indexOf(this);
      if (i !== -1) _instances.splice(i, 1);
      this.getVisitors().forEach((v) => v.onSurfaceUnmount(this));
    }

    componentDidUpdate() {
      this.redraw();
    }

    render() {
      const {
        props,
        state: { ready, rebootId, debug },
      } = this;
      const { children, style } = props;

      // We allow to pass-in all props we don't know so you can hook to DOM events.
      const rest = {};
      Object.keys(props).forEach((key) => {
        if (allSurfaceProps.indexOf(key) === -1) {
          rest[key] = props[key];
        }
      });

      return (
        <GLView
          key={rebootId}
          debug={debug}
          ref={this._onRef}
          onContextCreate={this._onContextCreate}
          onContextFailure={this._onContextFailure}
          onContextLost={this._onContextLost}
          onContextRestored={this._onContextRestored}
          style={style}
          {...rest}
        >
          {ready ? children : null}
        </GLView>
      );
    }

    rebootForDebug() {
      // FIXME: there is a bug somewhere that breaks rendering if this is called at startup time.
      this._stopLoop();
      this._destroyGL();
      this.setState(({ rebootId }) => ({
        rebootId: rebootId + 1,
        ready: false,
        debug: true,
      }));
    }

    getVisitors(): Array<VisitorLike> {
      return Visitors.get().concat(this.props.visitor || []);
    }

    getGLSize(): [number, number] {
      const { gl } = this;
      return [gl ? gl.drawingBufferWidth : 0, gl ? gl.drawingBufferHeight : 0];
    }

    getGLName(): string {
      return `Surface#${this.id}`;
    }

    getGLShortName(): string {
      return "Surface";
    }

    /**
     * see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
     * @param {string} mimeType (optional) the image MimeType
     * @param {number} quality (optional) the image quality
     * @memberof Surface
     * @instance
     */
    captureAsDataURL(...args: any): string {
      const { glView } = this;
      invariant(glView, "GLView is mounted");
      invariant(
        glView.captureAsDataURL,
        "captureAsDataURL is not defined in %s",
        GLView.displayName || GLView.name
      );
      return glView.captureAsDataURL(...args);
    }

    /**
     * see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
     * @param {string} mimeType (optional) the image MimeType
     * @param {number} quality (optional) the image quality
     * @memberof Surface
     * @instance
     */
    captureAsBlob(...args: any): Promise<Blob> {
      const { glView } = this;
      invariant(glView, "GLView is mounted");
      invariant(
        glView.captureAsBlob,
        "captureAsBlob is not defined in %s",
        GLView.displayName || GLView.name
      );
      return glView.captureAsBlob(...args);
    }

    /**
     * capture the root Node pixels. Make sure you have set `preserveDrawingBuffer: true` in `webglContextAttributes` prop.
     * @memberof Surface
     * @instance
     */
    capture(x?: number, y?: number, w?: number, h?: number): NDArray {
      invariant(
        this.root,
        "Surface#capture: surface is not yet ready or don't have any root Node"
      );
      return this.root.capture(x, y, w, h);
    }

    /**
     * Schedule a redraw of the Surface.
     * @memberof Surface
     * @instance
     * @function
     */
    redraw = (): void => {
      this._needsRedraw = true;
    };

    /**
     * Force the redraw (if any) to happen now, synchronously.
     * @memberof Surface
     * @instance
     * @function
     */
    flush = (): void => {
      this._draw();
    };

    glIsAvailable(): boolean {
      return !!this.gl;
    }

    _emptyTexture: ?WebGLTexture;
    getEmptyTexture(): WebGLTexture {
      let { gl, _emptyTexture } = this;
      invariant(gl, "getEmptyTexture called while gl was not defined");
      if (!_emptyTexture) {
        this._emptyTexture = _emptyTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, _emptyTexture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          2,
          2,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        );
      }
      return _emptyTexture;
    }

    _onContextCreate = (gl: WebGLRenderingContext): void => {
      const onSuccess = () => {
        this.setState(
          {
            ready: true,
          },
          () => {
            try {
              this._handleLoad();
            } catch (e) {
              this._handleError(e);
            }
          }
        );
      };
      this._prepareGL(gl, onSuccess, this._handleError);
    };

    _onContextFailure = (e: Error): void => {
      this._handleError(e);
    };

    _onContextLost = (): void => {
      if (this.props.onContextLost) this.props.onContextLost();
      this._stopLoop();
      this._destroyGL();
      if (this.root) this.root._onContextLost();
    };

    _onContextRestored = (gl: WebGLRenderingContext) => {
      if (this.root) this.root._onContextRestored(gl);
      this._prepareGL(
        gl,
        this._handleRestoredSuccess,
        this._handleRestoredFailure
      );
    };

    _destroyGL() {
      const { gl } = this;
      if (gl) {
        this.gl = null;
        if (this._emptyTexture) {
          gl.deleteTexture(this._emptyTexture);
          this._emptyTexture = null;
        }
        if (this.loaderResolver) {
          this.loaderResolver.dispose();
        }
        for (let k in this.shaders) {
          this.shaders[k].dispose();
        }
        this.shaders = {};
        gl.deleteBuffer(this.buffer);
        this.getVisitors().map((v) => v.onSurfaceGLContextChange(this, null));
      }
    }

    _prepareGL(
      gl: WebGLRenderingContext,
      onSuccess: () => void,
      onError: (e: Error) => void
    ) {
      this.gl = gl;
      this.getVisitors().map((v) => v.onSurfaceGLContextChange(this, gl));

      this.loaderResolver = new LoaderResolver(gl);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
        gl.STATIC_DRAW
      );
      this.buffer = buffer;

      const { preload } = this.props;

      const all: Array<Promise<*>> = [];

      (preload || []).forEach((raw) => {
        if (!raw) {
          console.warn("Can't preload value", raw);
          return;
        }
        const { loader, input } = this._resolveTextureLoader(raw);
        if (!loader) {
          console.warn("Can't preload input", raw, input);
          return;
        }
        const loadedAlready = loader.get(input);
        if (loadedAlready) return;
        all.push(loader.load(input));
      });

      this._preparingGL = all;

      if (all.length > 0) {
        Promise.all(all).then(onSuccess, onError); // FIXME make sure this never finish if _prepareGL is called again.
      } else {
        onSuccess();
      }
    }

    _onRef = (ref: ?GLView): void => {
      this.glView = ref;
    };

    _addGLNodeChild(node: Node): void {
      invariant(
        !this.root,
        "Surface can only contains a single root. Got: %s",
        this.root && this.root.getGLName()
      );
      this.root = node;
      node._addDependent(this);
      this.redraw();
    }
    _removeGLNodeChild(node: Node): void {
      this.root = null;
      this.redraw();
    }

    _handleError = (e: Error): void => {
      const { onLoadError } = this.props;
      if (onLoadError) onLoadError(e);
      else {
        console.error(e);
      }
    };

    _handleRestoredFailure = (): void => {
      // there is nothing we can do. it's a dead end.
    };

    _handleRestoredSuccess = (): void => {
      this.redraw();
      this.flush();
      this._startLoop();
      if (this.props.onContextRestored) this.props.onContextRestored();
    };

    _handleLoad = (): void => {
      if (!this.root) {
        console.warn(
          this.getGLName() + " children does not contain any discoverable Node"
        );
      }
      const { onLoad } = this.props;
      this.redraw();
      this.flush();
      this._startLoop();
      if (onLoad) onLoad();
    };

    _resolveTextureLoader(
      raw: mixed
    ): { loader: ?WebGLTextureLoader<*>, input: any } {
      let input = raw;
      let loader: ?WebGLTextureLoader<*> =
        this.loaderResolver && this.loaderResolver.resolve(input);
      return { loader, input };
    }

    _makeShader({ frag, vert }: ShaderInfo, name?: string): Shader {
      const { gl } = this;
      invariant(gl, "gl is not available");
      const shader = createShader(
        gl,
        prependGLSLName(vert, name),
        prependGLSLName(frag, name)
      );
      for (let key in shader.attributes) {
        shader.attributes[key].pointer();
      }
      return shader;
    }

    _getShader(shaderId: ShaderIdentifier): Shader {
      const { shaders } = this;
      return (
        shaders[shaderId.id] ||
        (shaders[shaderId.id] = this._makeShader(
          Shaders.get(shaderId),
          Shaders.getName(shaderId)
        ))
      );
    }

    _bindRootNode(): void {
      const { gl } = this;
      invariant(gl, "gl context not available");
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      const [width, height] = this.getGLSize();
      gl.viewport(0, 0, width, height);
    }

    _loopRaf: any;
    _startLoop(): void {
      cancelFrame(this._loopRaf);
      const loop = () => {
        this._loopRaf = requestFrame(loop);
        if (this._needsRedraw) this._draw();
      };
      this._loopRaf = requestFrame(loop);
    }

    _stopLoop(): void {
      cancelFrame(this._loopRaf);
    }

    _draw(): void {
      const { gl, root, glView } = this;
      invariant(glView, "GLView is mounted");
      const visitors = this.getVisitors();
      if (!gl || !root || !this._needsRedraw) {
        visitors.forEach((v) => v.onSurfaceDrawSkipped(this));
        return;
      }
      this._needsRedraw = false;
      visitors.forEach((v) => v.onSurfaceDrawStart(this));
      if (glView.beforeDraw) glView.beforeDraw(gl);
      try {
        root._draw();
      } catch (e) {
        let silent = false;
        visitors.forEach((v) => {
          silent = v.onSurfaceDrawError(e) || silent;
        });
        if (!silent) {
          if (
            __DEV__ &&
            glView.debugError &&
            e.longMessage /* duck typing an "interesting" GLError (from lib gl-shader) */
          ) {
            glView.debugError(e);
          } else {
            console.warn(e);
            throw e;
          }
        }
        return;
      }
      if (glView.afterDraw) glView.afterDraw(gl);
      visitors.forEach((v) => v.onSurfaceDrawEnd(this));
    }
  };
};
