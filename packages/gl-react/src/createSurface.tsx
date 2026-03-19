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
import GLContext from "./GLContext";

const __DEV__ = process.env.NODE_ENV === "development";

type SurfaceProps = {
  children?: any;
  style?: any;
  preload?: Array<any>;
  onLoad?: () => void;
  onLoadError?: (e: Error) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  visitor?: VisitorLike;
  [key: string]: any;
};

export interface Surface {
  props: SurfaceProps;
  gl: WebGLRenderingContext | null;
  RenderLessElement: any;
  root: Node | null;
  id: number;

  mapRenderableContent: ((inst: any) => any) | undefined;
  getVisitors(): Array<VisitorLike>;
  getGLSize(): [number, number];
  getGLName(): string;
  getGLShortName(): string;
  captureAsDataURL(...args: any[]): string;
  captureAsBlob(...args: any[]): Promise<Blob>;
  capture(x?: number, y?: number, w?: number, h?: number): NDArray;
  redraw(): void;
  flush(): void;
  getEmptyTexture(): WebGLTexture;
  glIsAvailable(): boolean;

  rebootForDebug(): void;
  _addGLNodeChild(node: Node): void;
  _removeGLNodeChild(node: Node): void;
  _resolveTextureLoader(raw: any): {
    loader: WebGLTextureLoader | null;
    input: any;
  };
  _getShader(shaderId: ShaderIdentifier): Shader;
  _makeShader(shaderInfo: ShaderInfo): Shader;
  _draw(): void;
  _bindRootNode(): void;
}

export type SurfaceContext = {
  glParent: Node | Surface | Bus;
  glSurface: Surface;
  glSizable: { getGLSize(): [number, number] };
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
const _instances: Array<any> = [];
export const list = (): Array<Surface> => _instances.slice(0);

const allSurfaceProps = Object.keys(SurfacePropTypes);

type SurfaceOpts = {
  GLView: any;
  RenderLessElement: any;
  mapRenderableContent?: (instance: any) => any;
  requestFrame: (f: Function) => number;
  cancelFrame: (id: number) => void;
};

export default ({
  GLView,
  RenderLessElement,
  mapRenderableContent,
  requestFrame,
  cancelFrame,
}: SurfaceOpts): any => {
  return class Surface extends Component<
    SurfaceProps,
    {
      ready: boolean;
      rebootId: number;
      debug: boolean;
    }
  > {
    id: number = ++surfaceId;
    gl: WebGLRenderingContext | null = null;
    buffer!: WebGLBuffer;
    loaderResolver: LoaderResolver | null = null;
    glView: any;
    root: Node | null = null;
    shaders: { [key: string]: Shader } = {};
    _preparingGL: Array<any> = [];
    _needsRedraw: boolean = false;
    state = {
      ready: false,
      rebootId: 0,
      debug: false,
    };

    RenderLessElement = RenderLessElement;
    mapRenderableContent = mapRenderableContent;

    static propTypes = SurfacePropTypes;

    componentDidMount() {
      _instances.push(this);
      this.getVisitors().forEach((v) => v.onSurfaceMount(this as any));
    }

    componentWillUnmount() {
      this._stopLoop();
      this._destroyGL();
      const i = _instances.indexOf(this);
      if (i !== -1) _instances.splice(i, 1);
      this.getVisitors().forEach((v) => v.onSurfaceUnmount(this as any));
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
      const rest: any = {};
      Object.keys(props).forEach((key) => {
        if (allSurfaceProps.indexOf(key) === -1) {
          rest[key] = (props as any)[key];
        }
      });

      return (
        <GLContext.Provider
          value={{ glParent: this, glSurface: this, glSizable: this }}
        >
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
        </GLContext.Provider>
      );
    }

    rebootForDebug() {
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
      return [
        gl ? gl.drawingBufferWidth : 0,
        gl ? gl.drawingBufferHeight : 0,
      ];
    }

    getGLName(): string {
      return `Surface#${this.id}`;
    }

    getGLShortName(): string {
      return "Surface";
    }

    captureAsDataURL(...args: any[]): string {
      const { glView } = this;
      invariant(glView, "GLView is mounted");
      invariant(
        glView.captureAsDataURL,
        "captureAsDataURL is not defined in %s",
        GLView.displayName || GLView.name
      );
      return glView.captureAsDataURL(...args);
    }

    captureAsBlob(...args: any[]): Promise<Blob> {
      const { glView } = this;
      invariant(glView, "GLView is mounted");
      invariant(
        glView.captureAsBlob,
        "captureAsBlob is not defined in %s",
        GLView.displayName || GLView.name
      );
      return glView.captureAsBlob(...args);
    }

    capture(x?: number, y?: number, w?: number, h?: number): NDArray {
      invariant(
        this.root,
        "Surface#capture: surface is not yet ready or don't have any root Node"
      );
      return this.root!.capture(x, y, w, h);
    }

    redraw = (): void => {
      this._needsRedraw = true;
    };

    flush = (): void => {
      this._draw();
    };

    glIsAvailable(): boolean {
      return !!this.gl;
    }

    _emptyTexture: WebGLTexture | null = null;
    getEmptyTexture(): WebGLTexture {
      let { gl, _emptyTexture } = this;
      invariant(gl, "getEmptyTexture called while gl was not defined");
      if (!_emptyTexture) {
        this._emptyTexture = _emptyTexture = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, _emptyTexture);
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RGBA,
          2,
          2,
          0,
          gl!.RGBA,
          gl!.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        );
      }
      return _emptyTexture!;
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
            } catch (e: any) {
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
        this.getVisitors().map((v) =>
          v.onSurfaceGLContextChange(this as any, null)
        );
      }
    }

    _prepareGL(
      gl: WebGLRenderingContext,
      onSuccess: () => void,
      onError: (e: Error) => void
    ) {
      this.gl = gl;
      this.getVisitors().map((v) =>
        v.onSurfaceGLContextChange(this as any, gl)
      );

      this.loaderResolver = new LoaderResolver(gl);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 4, 4, -1]), // see a-big-triangle
        gl.STATIC_DRAW
      );
      this.buffer = buffer;

      const { preload } = this.props;

      const all: Array<Promise<any>> = [];

      (preload || []).forEach((raw: any) => {
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
        Promise.all(all).then(onSuccess, onError);
      } else {
        onSuccess();
      }
    }

    _onRef = (ref: any): void => {
      this.glView = ref;
    };

    _addGLNodeChild(node: Node): void {
      invariant(
        !this.root,
        "Surface can only contains a single root. Got: %s",
        this.root && this.root.getGLName()
      );
      this.root = node;
      node._addDependent(this as any);
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
          this.getGLName() +
            " children does not contain any discoverable Node"
        );
      }
      const { onLoad } = this.props;
      this.redraw();
      this.flush();
      this._startLoop();
      if (onLoad) onLoad();
    };

    _resolveTextureLoader(raw: any): {
      loader: WebGLTextureLoader | null;
      input: any;
    } {
      let input = raw;
      let loader: WebGLTextureLoader | null =
        (this.loaderResolver && this.loaderResolver.resolve(input)) || null;
      return { loader, input };
    }

    _makeShader({ frag, vert }: ShaderInfo, name?: string): Shader {
      const { gl } = this;
      invariant(gl, "gl is not available");
      const shader = createShader(gl!, vert, frag);
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
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      const [width, height] = this.getGLSize();
      gl!.viewport(0, 0, width, height);
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
        visitors.forEach((v) => v.onSurfaceDrawSkipped(this as any));
        return;
      }
      this._needsRedraw = false;
      visitors.forEach((v) => v.onSurfaceDrawStart(this as any));
      if (glView.beforeDraw) glView.beforeDraw(gl);
      try {
        root._draw();
      } catch (e: any) {
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
      visitors.forEach((v) => v.onSurfaceDrawEnd(this as any));
    }
  };
};
