import invariant from "invariant";
import React, { Component } from "react";
import PropTypes from "prop-types";
import pool from "typedarray-pool";
import ndarray from "ndarray";
import Uniform from "./Uniform";
import Bus from "./Bus";
import Shaders, {
  isShaderIdentifier,
  ensureShaderDefinition,
  shaderDefinitionToShaderInfo,
  shaderInfoEquals,
} from "./Shaders";
import invariantNoDependentsLoop from "./helpers/invariantNoDependentsLoop";
import genId from "./genId";
import type { Shader } from "gl-shader";
import type { NDArray } from "ndarray";
import type {
  ShaderIdentifier,
  ShaderInfo,
  ShaderDefinition,
} from "./Shaders";
import type { Surface, SurfaceContext } from "./createSurface";
import GLContext from "./GLContext";

const blendFuncAliases: { [key: string]: string } = {
  zero: "ZERO",
  one: "ONE",
  "src color": "SRC_COLOR",
  "one minus src color": "ONE_MINUS_SRC_COLOR",
  "src alpha": "SRC_ALPHA",
  "one minus src alpha": "ONE_MINUS_SRC_ALPHA",
  "dst color": "DST_COLOR",
  "one minus dst color": "ONE_MINUS_DST_COLOR",
  "dst alpha": "DST_ALPHA",
  "one minus dst alpha": "ONE_MINUS_DST_ALPHA",
  "constant color": "CONSTANT_COLOR",
  "one minus constant color": "ONE_MINUS_CONSTANT_COLOR",
  "constant alpha": "CONSTANT_ALPHA",
  "one minus constant alpha": "ONE_MINUS_CONSTANT_ALPHA",
  "src alpha saturate": "SRC_ALPHA_SATURATE",
};

type Interpolation = "linear" | "nearest";

type WrapMode = "clamp to edge" | "repeat" | "mirrored repeat";

type TextureOptions = {
  interpolation: Interpolation;
  wrap: [WrapMode, WrapMode] | WrapMode;
};

type BlendFunc = keyof typeof blendFuncAliases;

type BlendFuncSrcDst = {
  src: BlendFunc;
  dst: BlendFunc;
};

type Vec4 = [number, number, number, number];

type Clear = {
  color: Vec4;
};

type Uniforms = {
  [key: string]: any;
};

type UniformsOptions = {
  [key: string]: Partial<TextureOptions> | null | undefined;
};

type Props = {
  shader: ShaderIdentifier | ShaderDefinition;
  uniformsOptions: UniformsOptions;
  uniforms: Uniforms;
  ignoreUnusedUniforms?: Array<string> | boolean;
  sync?: boolean;
  width?: number;
  height?: number;
  children?: any;
  backbuffering?: boolean;
  blendFunc: BlendFuncSrcDst;
  clear: Clear | null;
  onDraw?: () => void;
};

type AsyncMixed = (redraw?: () => void) => any;

const isBackbuffer = (obj: any) => {
  if (obj === "Backbuffer") {
    console.warn(
      'Backbuffer is deprecated, use Uniform.Backbuffer instead: `import {Uniform} from "gl-react"`'
    );
    return true;
  }
  return obj === Uniform.Backbuffer;
};

const isBackbufferFrom = (obj: any) =>
  obj && typeof obj === "object" && obj.type === "BackbufferFrom";

const isTextureSizeGetter = (obj: any) =>
  obj && typeof obj === "object" && obj.type === "TextureSize";

const nodeWidthHeight = (
  { width, height }: Props,
  { glSizable }: SurfaceContext
): [number, number] => {
  if (width && height) return [width, height];
  const [cw, ch] = glSizable.getGLSize();
  return [width || cw, height || ch];
};

const mapBlendFunc = (
  gl: WebGLRenderingContext,
  name: BlendFunc
): number | undefined => {
  if (name in gl) return (gl as any)[name];
  if (name in blendFuncAliases) {
    const id = blendFuncAliases[name];
    if (id in gl) return (gl as any)[id];
  }
  console.warn("Invalid blendFunc. Got:", name);
};

const parseWrap = (gl: WebGLRenderingContext, w: string): number => {
  switch (w) {
    case "clamp to edge":
      return gl.CLAMP_TO_EDGE;
    case "repeat":
      return gl.REPEAT;
    case "mirrored repeat":
      return gl.MIRRORED_REPEAT;
    default:
      console.warn("Invalid wrap. Got:", w);
      return gl.CLAMP_TO_EDGE;
  }
};

const mergeArrays = (a: Array<any>, b: Array<any>): Array<any> => {
  const t: any[] = [];
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    t[i] = b[i] || a[i];
  }
  return t;
};

const parseInterpolation = (gl: WebGLRenderingContext, i: string): number => {
  switch (i) {
    case "linear":
      return gl.LINEAR;
    case "nearest":
      return gl.NEAREST;
    default:
      console.warn("Invalid interpolation. Got:", i);
      return gl.LINEAR;
  }
};

type Framebuffer = {
  handle: WebGLFramebuffer;
  color: WebGLTexture;
  bind: () => void;
  dispose: () => void;
  syncSize: (w: number, h: number) => void;
};

// minimal version of gl-fbo
const createFBO = (
  gl: WebGLRenderingContext,
  width: number,
  height: number
): Framebuffer => {
  var handle = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
  var color = gl.createTexture();
  if (!color) throw new Error("createTexture returned null");
  gl.bindTexture(gl.TEXTURE_2D, color);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    color,
    0
  );
  return {
    handle,
    color,
    bind: () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
      gl.viewport(0, 0, width, height);
    },
    syncSize: (w: number, h: number) => {
      if (w !== width || h !== height) {
        width = w;
        height = h;
        gl.bindTexture(gl.TEXTURE_2D, color);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          w,
          h,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        );
      }
    },
    dispose: () => {
      gl.deleteFramebuffer(handle);
      gl.deleteTexture(color);
    },
  };
};

const defaultTextureOptions: TextureOptions = {
  interpolation: "linear",
  wrap: ["clamp to edge", "clamp to edge"],
};

const applyTextureOptions = (
  gl: WebGLRenderingContext,
  partialOpts: Partial<TextureOptions> | null | undefined
) => {
  const opts: TextureOptions = { ...defaultTextureOptions, ...partialOpts };
  let filter = parseInterpolation(gl, opts.interpolation);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  let wrapS: number, wrapT: number;
  if (Array.isArray(opts.wrap)) {
    if (opts.wrap.length !== 2) {
      console.warn(
        "textureOptions wrap: should be an array of 2 values. Got:",
        opts.wrap
      );
      wrapS = wrapT = gl.CLAMP_TO_EDGE;
    } else {
      wrapS = parseWrap(gl, opts.wrap[0]);
      wrapT = parseWrap(gl, opts.wrap[1]);
    }
  } else {
    wrapS = wrapT = parseWrap(gl, opts.wrap);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
};

const NodePropTypes = {
  shader: PropTypes.object.isRequired,
  uniformsOptions: PropTypes.object,
  uniforms: PropTypes.object,
  ignoreUnusedUniforms: PropTypes.any,
  sync: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.any,
  backbuffering: PropTypes.bool,
  blendFunc: PropTypes.object,
  clear: PropTypes.object,
  onDraw: PropTypes.func,
};

/**
 * `<Node>` is the primitive that renders a shader program into a Framebuffer.
 * It can be composed with other `Node` via using a sampler2D uniforms.
 */
export default class Node extends Component<Props, any> {
  drawProps: Props = this.props;
  context!: SurfaceContext;
  framebuffer?: Framebuffer;
  backbuffer?: Framebuffer;
  _needsRedraw: boolean = false;
  capturePixelsArray?: Uint8Array;
  id: number = genId();
  uniformsBus: { [key: string]: Array<Bus | null> } = {};
  dependencies: Array<Node | Bus> = []; // Node this instance depends on
  dependents: Array<Node | Surface> = []; // Node/Surface that depends on this instance

  static propTypes = NodePropTypes;

  static defaultProps = {
    uniformsOptions: {},
    uniforms: {},
    blendFunc: {
      src: "src alpha",
      dst: "one minus src alpha",
    },
    clear: {
      color: [0, 0, 0, 0] as Vec4,
    },
  };

  static contextType = GLContext;

  componentDidMount() {
    const {
      glSurface: { gl },
    } = this.context;
    if (gl) this._prepareGLObjects(gl);
    this.context.glParent._addGLNodeChild(this);
    this.redraw();
    if (this.props.sync) this.flush();
  }

  componentWillUnmount() {
    const { capturePixelsArray } = this;
    this._destroyGLObjects();
    if (capturePixelsArray) {
      pool.freeUint8(capturePixelsArray);
    }
    this._needsRedraw = false;
    this.context.glParent._removeGLNodeChild(this);
    this.dependencies.forEach((d) => d._removeDependent(this));
  }

  _syncNextDrawProps(nextProps: Props, nextContext: any) {
    const nextWidthHeight = nodeWidthHeight(nextProps, nextContext);
    if (this.framebuffer) {
      this.framebuffer.syncSize(...nextWidthHeight);
    }
    if (this.backbuffer) {
      this.backbuffer.syncSize(...nextWidthHeight);
    }
    invariant(
      nextProps.backbuffering === this.drawProps.backbuffering,
      "Node backbuffering prop must not changed. (not yet supported)"
    );
    this.drawProps = nextProps;
  }

  _resolveElement = (
    uniform: string,
    value: any,
    index: number
  ): React.ReactElement | undefined => {
    if (!React.isValidElement(value)) {
      if (typeof value === "function") {
        value = (value as AsyncMixed)(this.redraw);
        if (!React.isValidElement(value)) {
          return; // the function don't return an Element, skip
        }
      } else {
        return; // the value isn't an Element, skip
      }
    }
    return (
      <Bus
        key={uniform + (index ? "." + index : "")}
        uniform={uniform}
        index={index}
      >
        {value}
      </Bus>
    );
  };

  _renderUniformElement = (key: string) => {
    const { uniforms } = this.props;
    let value = uniforms[key];
    return Array.isArray(value)
      ? value.map((v: any, i: number) => this._resolveElement(key, v, i))
      : this._resolveElement(key, value, 0);
  };

  render() {
    const { children, uniforms } = this.props;
    const {
      glSurface: { RenderLessElement },
    } = this.context;
    return (
      <GLContext.Provider
        value={{
          glParent: this,
          glSurface: this.context.glSurface,
          glSizable: this,
        }}
      >
        <RenderLessElement>
          {children}
          {Object.keys(uniforms).map(this._renderUniformElement)}
        </RenderLessElement>
      </GLContext.Provider>
    );
  }

  componentDidUpdate() {
    this._syncNextDrawProps(this.props, this.context);
    this.redraw();
    if (this.props.sync) this.flush();
  }

  getGLShortName(): string {
    const { shader } = this.drawProps;
    const shaderName = isShaderIdentifier(shader)
      ? Shaders.getShortName(shader as ShaderIdentifier)
      : "<inline>";
    return `Node(${shaderName})`;
  }

  getGLName(): string {
    const { shader } = this.drawProps;
    const shaderName = isShaderIdentifier(shader)
      ? Shaders.getName(shader as ShaderIdentifier)
      : "<inline>";
    return `Node#${this.id}(${shaderName})`;
  }

  getGLSize(): [number, number] {
    return nodeWidthHeight(this.drawProps, this.context);
  }

  getGLOutput(): WebGLTexture {
    const { framebuffer } = this;
    invariant(
      framebuffer,
      "Node#getGLOutput: framebuffer is not defined. It cannot be called on a root Node"
    );
    return framebuffer!.color;
  }

  getGLBackbufferOutput(): WebGLTexture {
    const { backbuffer } = this;
    invariant(
      backbuffer,
      "Node#getGLBackbufferOutput: backbuffer is not defined. Make sure `backbuffering` prop is defined"
    );
    return backbuffer!.color;
  }

  /**
   * Imperatively set the props with a partial subset of props to apply.
   */
  setDrawProps(patch: Partial<Props>) {
    const nextProps: Props = {
      ...this.drawProps,
      ...patch,
    };
    this._syncNextDrawProps(nextProps, this.context);
    this.redraw();
    if (nextProps.sync) this.flush();
  }

  /**
   * Capture the node pixels.
   */
  capture(x?: number, y?: number, w?: number, h?: number): NDArray {
    const [width, height] = this.getGLSize();
    const { gl } = this.context.glSurface;
    invariant(gl, "gl is no longer available");
    if (x === undefined) x = 0;
    if (y === undefined) y = 0;
    if (w === undefined) w = width - x;
    if (h === undefined) h = height - y;
    invariant(
      x >= 0 && x + w <= width && y >= 0 && y + h <= height,
      "capture(%s,%s,%s,%s): requested rectangle is out of bounds (%s,%s)",
      x,
      y,
      w,
      h,
      width,
      height
    );
    const size = w * h * 4;
    const pixels: Uint8Array = this._captureAlloc(size);
    this._bind();
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return ndarray(pixels, [h, w, 4]).step(-1, 1, 1).transpose(1, 0, 2);
  }

  /**
   * Schedule a redraw of this node and all dependent nodes.
   */
  redraw = (): void => {
    if (!this._needsRedraw) {
      this._needsRedraw = true;
      this.dependents.forEach((d) => d.redraw());
    }
  };

  /**
   * Force the redraw (if any) to happen now, synchronously.
   */
  flush = (): void => {
    this.context.glSurface._draw();
  };

  _destroyGLObjects(): void {
    const { glSurface } = this.context;
    if (glSurface.glIsAvailable()) {
      const { framebuffer, backbuffer, _shader } = this;
      if (_shader) {
        _shader.dispose();
      }
      if (framebuffer) {
        framebuffer.dispose();
      }
      if (backbuffer) {
        backbuffer.dispose();
      }
    }
    this._shader = undefined;
    this.framebuffer = undefined;
    this.backbuffer = undefined;
  }

  _prepareGLObjects(gl: WebGLRenderingContext): void {
    const [width, height] = this.getGLSize();
    const { glParent, glSurface } = this.context;
    if (glParent === glSurface) {
      invariant(
        !this.drawProps.backbuffering,
        "`backbuffering` is currently not supported for a Root Node. " +
          "Try to wrap %s in a <LinearCopy> or <NearestCopy>.",
        this.getGLName()
      );
    } else {
      const fbo = createFBO(gl, width, height);
      this.framebuffer = fbo;
      if (this.drawProps.backbuffering) {
        const fbo = createFBO(gl, width, height);
        this.backbuffer = fbo;
      }
    }
  }

  _onContextLost(): void {
    this.dependencies.forEach((d) => d._onContextLost());
    this._destroyGLObjects();
  }

  _onContextRestored(gl: WebGLRenderingContext): void {
    this._prepareGLObjects(gl);
    this.dependencies.forEach((d) => d._onContextRestored(gl));
    this._needsRedraw = true;
  }

  _addGLNodeChild(node: Node) {}
  _removeGLNodeChild(node: Node) {}

  _addUniformBus(uniformBus: Bus, uniformName: string, index: number): void {
    const array =
      this.uniformsBus[uniformName] ||
      (this.uniformsBus[uniformName] = []);
    array[index] = uniformBus;
  }

  _removeUniformBus(
    uniformBus: Bus,
    uniformName: string,
    index: number
  ): void {
    const array =
      this.uniformsBus[uniformName] ||
      (this.uniformsBus[uniformName] = []);
    if (array[index] === uniformBus) {
      array[index] = null;
    }
  }

  _addDependent(node: Node | Surface): void {
    const i = this.dependents.indexOf(node as any);
    if (i === -1) {
      invariantNoDependentsLoop(this, node);
      this.dependents.push(node as any);
    }
  }

  _removeDependent(node: Node | Surface): void {
    const i = this.dependents.indexOf(node as any);
    if (i !== -1) {
      this.dependents.splice(i, 1);
    }
  }

  _syncDependencies(
    newdeps: Array<Node | Bus>
  ): [Array<Bus | Node>, Array<Bus | Node>] {
    const olddeps = this.dependencies;
    const additions = newdeps.filter(
      (node) => olddeps.indexOf(node) === -1
    );
    const deletions = olddeps.filter(
      (node) => newdeps.indexOf(node) === -1
    );
    olddeps.forEach((d) => d._removeDependent(this));
    newdeps.forEach((d) => d._addDependent(this));
    this.dependencies = newdeps;
    return [additions, deletions];
  }

  _bind(): void {
    if (this.framebuffer) {
      this.framebuffer.bind();
    } else {
      this.context.glSurface._bindRootNode();
    }
  }

  _captureAlloc(size: number): Uint8Array {
    let { capturePixelsArray } = this;
    if (capturePixelsArray && size !== capturePixelsArray.length) {
      pool.freeUint8(capturePixelsArray);
      capturePixelsArray = undefined;
    }
    const pixels: Uint8Array =
      capturePixelsArray || pool.mallocUint8(size);
    this.capturePixelsArray = pixels;
    return pixels;
  }

  _latestShaderInfo?: ShaderInfo;
  _shader?: Shader;

  _getShader(shaderProp: any): Shader {
    const { glSurface } = this.context;
    const nodeName = this.getGLName();
    invariant(shaderProp, nodeName + ": shader prop must be provided");
    if (isShaderIdentifier(shaderProp)) {
      return glSurface._getShader(shaderProp as ShaderIdentifier);
    }

    const shaderInfo = shaderDefinitionToShaderInfo(
      ensureShaderDefinition(shaderProp, " in " + nodeName),
      nodeName
    );
    const latestShaderInfo = this._latestShaderInfo;
    let shader = this._shader;
    if (
      !shader ||
      !latestShaderInfo ||
      !shaderInfoEquals(latestShaderInfo, shaderInfo)
    ) {
      if (shader) {
        shader.dispose();
        this._shader = undefined;
      }
      shader = glSurface._makeShader(shaderInfo);
      this._latestShaderInfo = shaderInfo;
      this._shader = shader;
    }
    return shader;
  }

  _draw(): void {
    const { glSurface } = this.context;
    const { gl } = glSurface;
    const visitors = glSurface.getVisitors();
    const nodeName = this.getGLName();
    if (!gl || !this._needsRedraw) {
      visitors.forEach((v) => v.onNodeDrawSkipped(this));
      return;
    }

    const {
      backbuffering,
      uniforms,
      uniformsOptions,
      shader: shaderProp,
      blendFunc,
      clear,
      onDraw,
      ignoreUnusedUniforms,
    } = this.drawProps;

    //~ PREPARE phase

    if (!this.framebuffer) {
      const { glSizable } = this.context;
      const [width, height] = glSizable.getGLSize();
      const [nw, nh] = this.getGLSize();
      invariant(
        nw === width && nh === height,
        nodeName +
          " is root but have overrided {width=%s,height=%s} which doesn't match Surface size {width=%s,height=%s}. " +
          "Try to wrap your Node in a <NearestCopy> or <LinearCopy>",
        nw,
        nh,
        width,
        height
      );
    }

    const shader = this._getShader(shaderProp);

    this._needsRedraw = false;

    const { types } = shader;
    const glRedrawableDependencies: Array<Node | Bus> = [];
    const pendingTextures: Array<any> = [];
    let units = 0;
    const usedUniforms = Object.keys(types.uniforms);
    const providedUniforms = Object.keys(uniforms);
    const { uniformsBus } = this;
    for (let k in uniformsBus) {
      if (!(k in uniforms)) {
        providedUniforms.push(k);
      }
    }
    const textureUnits: Map<WebGLTexture, number> = new Map();

    const prepareTexture = (
      initialObj: any,
      uniformOptions: Partial<TextureOptions> | null | undefined,
      uniformKeyName: string
    ) => {
      let obj = initialObj,
        dependency: (Node | Bus) | null = null,
        result:
          | {
              directTexture?: WebGLTexture | null;
              directTextureSize?: [number, number] | null;
              glNode?: Node;
              glNodePickBackbuffer?: boolean;
            }
          | null = null;

      if (typeof obj === "function") {
        obj = (obj as AsyncMixed)(this.redraw);
      }

      if (!obj) {
        if (obj === undefined) {
          console.warn(
            `${nodeName}, uniform '${uniformKeyName}' is undefined.` +
              "If you explicitely want to clear a texture, set it to null."
          );
        }
      } else if (isBackbuffer(obj)) {
        if (!this.drawProps.backbuffering) {
          console.warn(
            `${nodeName}, uniform ${uniformKeyName}: you must set \`backbuffering\` on Node when using Backbuffer`
          );
        }
        result = { glNode: this, glNodePickBackbuffer: true };
      } else if (isBackbufferFrom(obj)) {
        invariant(
          typeof obj === "object",
          "invalid backbufferFromNode. Got: %s",
          obj
        );
        let node = obj.node;
        if (node instanceof Bus) {
          node = node.getGLRenderableNode();
          invariant(
            node,
            "backbufferFromNode(bus) but bus.getGLRenderableNode() is %s",
            node
          );
        }
        invariant(
          node instanceof Node,
          "invalid backbufferFromNode(obj): obj must be an instanceof Node or Bus. Got: %s",
          obj
        );
        if (!node.drawProps.backbuffering) {
          console.warn(
            `${nodeName}, uniform ${uniformKeyName}: you must set \`backbuffering\` on the Node referenced in backbufferFrom(${node.getGLName()})`
          );
        }
        result = { glNode: node, glNodePickBackbuffer: true };
      } else if (obj instanceof Node) {
        dependency = obj;
        result = { glNode: obj };
      } else if (obj instanceof Bus) {
        const node = obj.getGLRenderableNode();
        if (node) {
          dependency = node;
          result = { glNode: node };
        } else {
          dependency = obj;
          const renderable: any = obj.getGLRenderableContent();
          if (!renderable) {
            console.warn(
              `${nodeName}, uniform ${uniformKeyName}: child is not renderable. Got:`,
              renderable
            );
            result = { directTexture: null };
          } else {
            obj = renderable;
          }
        }
      }

      if (!result && obj) {
        const { loader, input } = glSurface._resolveTextureLoader(obj);
        if (!loader) {
          console.warn(
            `${nodeName}, uniform ${uniformKeyName}: no loader found for value`,
            input,
            obj
          );
        } else {
          const t = loader.get(input);
          if (t) {
            loader.update(input);
            result = {
              directTexture: t.texture,
              directTextureSize: [t.width, t.height],
            };
          } else {
            const p = loader.load(input);
            pendingTextures.push(p);
          }
        }
      }

      if (dependency) glRedrawableDependencies.push(dependency);

      const textureOptions = result ? uniformOptions : null;
      const getMetaInfo = () => ({
        initialObj,
        obj,
        dependency,
        textureOptions,
      });
      const getSize = (): [number, number] | null => {
        const fallback: [number, number] = [2, 2];
        return result
          ? "directTextureSize" in result
            ? result.directTextureSize || fallback
            : result.glNode
              ? result.glNode.getGLSize()
              : fallback
          : fallback;
      };
      const prepare = () => {
        const texture: WebGLTexture =
          (result &&
            (result.directTexture ||
              (result.glNode &&
                (result.glNodePickBackbuffer
                  ? result.glNode.getGLBackbufferOutput()
                  : result.glNode.getGLOutput())))) ||
          glSurface.getEmptyTexture();
        if (textureUnits.has(texture)) {
          return textureUnits.get(texture);
        }
        const value = units++;
        gl.activeTexture(gl.TEXTURE0 + value);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        applyTextureOptions(gl, textureOptions);
        textureUnits.set(texture, value);
        return value;
      };
      return {
        getMetaInfo,
        getSize,
        prepare,
      };
    };

    const prepareUniform = (key: string) => {
      const uniformType = types.uniforms[key];
      if (!uniformType) {
        const ignoredWarn =
          ignoreUnusedUniforms === true ||
          (ignoreUnusedUniforms instanceof Array &&
            ignoreUnusedUniforms.includes(key));
        if (!ignoredWarn) {
          console.warn(
            `${nodeName} uniform '${key}' is not declared, nor used, in your shader code`
          );
        }
        return { key, value: undefined };
      }
      const uniformValue = uniforms[key];
      usedUniforms.splice(usedUniforms.indexOf(key), 1);

      if (uniformType === "sampler2D") {
        const uniformBus = uniformsBus[key];
        const { getMetaInfo, prepare } = prepareTexture(
          (uniformBus && uniformBus[0]) || uniformValue,
          uniformsOptions[key],
          key
        );
        return {
          key,
          type: uniformType,
          getMetaInfo,
          prepare,
        };
      } else if (uniformValue === Uniform.Resolution) {
        return {
          key,
          type: uniformType,
          value: this.getGLSize(),
        };
      } else if (isTextureSizeGetter(uniformValue)) {
        invariant(
          uniformValue && typeof uniformValue === "object",
          "unexpected textureSize object. Got: %s",
          uniformValue
        );
        const { getSize } = prepareTexture(uniformValue.obj, null, key);
        const size = getSize();
        if (!size) {
          console.warn(
            `${nodeName}, uniform ${key}: texture size is undetermined`
          );
        }
        const value = uniformValue.ratio
          ? size
            ? size[0] / size[1]
            : 1
          : size || [0, 0];
        return {
          key,
          type: uniformType,
          value,
        };
      } else if (
        Array.isArray(uniformType) &&
        uniformType[0] === "sampler2D"
      ) {
        let values: any[];
        const uniformBus = uniformsBus[key];
        const v = mergeArrays(
          Array.isArray(uniformValue) ? uniformValue : [],
          Array.isArray(uniformBus) ? uniformBus : []
        );
        if (!v.length) {
          console.warn(
            `${nodeName}, uniform '${key}' should be an array of textures.`
          );
          values = uniformType.map(() => null);
        } else if (v.length !== uniformType.length) {
          console.warn(
            `${nodeName}, uniform '${key}' should be an array of exactly ${uniformType.length} textures (not ${v.length}).`
          );
          values = uniformType.map(() => null);
        } else {
          values = v;
        }

        const uniformOptions = uniformsOptions[key];
        const all = values.map((value: any, i: number) =>
          prepareTexture(value, uniformOptions, key + "[" + i + "]")
        );

        return {
          key,
          type: uniformType,
          getMetaInfo: () =>
            all.reduce(
              (acc: any[], o: any) => acc.concat(o.getMetaInfo()),
              []
            ),
          prepare: () => all.map((o: any) => o.prepare()),
        };
      } else {
        if (uniformValue === undefined) {
          console.warn(`${nodeName}, uniform '${key}' is undefined.`);
        }
        return {
          key,
          type: uniformType,
          value: uniformValue,
        };
      }
    };
    const preparedUniforms = providedUniforms.map(prepareUniform);

    if (usedUniforms.length !== 0) {
      console.warn(
        nodeName +
          ": Missing uniforms: " +
          usedUniforms.map((u) => `'${u}'`).join(", ") +
          "\n" +
          "all uniforms must be provided " +
          "because implementations might share and reuse a Shader Program"
      );
    }

    if (pendingTextures.length > 0) {
      Promise.all(pendingTextures).then(this.redraw);
      visitors.forEach((v) => v.onNodeDrawSkipped(this));
      return;
    }

    visitors.forEach((v) => v.onNodeDrawStart(this));

    const [additions, deletions] = this._syncDependencies(
      glRedrawableDependencies
    );
    visitors.forEach((v) => v.onNodeSyncDeps(this, additions, deletions));

    if (backbuffering) {
      const { backbuffer, framebuffer } = this;
      this.backbuffer = framebuffer;
      if (backbuffer) {
        this.framebuffer = backbuffer;
      }
    }

    const drawDep = (d: any) => d._draw();
    this.dependencies.forEach(drawDep);

    visitors.forEach((v) => v.onNodeDraw(this, preparedUniforms));

    shader.bind();
    this._bind();
    preparedUniforms.forEach((obj) => {
      const value = obj.prepare ? obj.prepare() : obj.value;
      if (value !== undefined) {
        shader.uniforms[obj.key] = value;
      }
    });

    if (blendFunc) {
      const src = mapBlendFunc(gl, blendFunc.src);
      const dst = mapBlendFunc(gl, blendFunc.dst);
      if (src && dst) gl.blendFunc(src, dst);
    }

    if (clear) {
      gl.clearColor(...clear.color);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (onDraw) onDraw();

    visitors.forEach((v) => v.onNodeDrawEnd(this));
  }
}
