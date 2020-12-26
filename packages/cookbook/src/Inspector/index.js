//@flow
import React, { PureComponent, Component } from "react";
import PropTypes from "prop-types";
import {
  Visitors,
  VisitorLogger,
  Node,
  Bus,
  Uniform,
  listSurfaces,
} from "gl-react";
import raf from "raf";
import type { Surface } from "gl-react-dom";
import createTexture from "gl-texture2d";
import createShader from "gl-shader";
import throttle from "lodash/throttle";
import "./index.css";

const drawTimeWindow = 1000;
const anchorYOff = 30;

const formatNumber = (n: number) => {
  const str = String(n);
  const i = str.indexOf(".");
  if (i === -1) return str;
  return str.slice(0, i + 1 + Math.max(1, 5 - i));
};
const formatObject = (o: any) => {
  if (typeof o === "object") {
    const name = o && o.constructor && o.constructor.name;
    if (name) {
      return "[object " + String(name) + "]";
    }
  }
  return String(o);
};

const primitiveTypeAlias = {
  vec2: Array(2).fill("float"),
  vec3: Array(3).fill("float"),
  vec4: Array(4).fill("float"),
  ivec2: Array(2).fill("int"),
  ivec3: Array(3).fill("int"),
  ivec4: Array(4).fill("int"),
  bvec2: Array(2).fill("bool"),
  bvec3: Array(3).fill("bool"),
  bvec4: Array(4).fill("bool"),
  mat2: Array(4).fill("float"),
  mat3: Array(9).fill("float"),
  mat4: Array(16).fill("float"),
};

const classType = (type) => {
  if (Array.isArray(type)) return "type-array-" + type[0];
  return "type-" + type;
};

const inferSize = (obj: any): [number, number] => {
  if (obj) {
    if (obj.shape) {
      return obj.shape;
    }
    if (obj.videoWidth && obj.videoHeight) {
      return [obj.videoWidth, obj.videoHeight];
    }
    if (obj.width && obj.height) {
      return [obj.width, obj.height];
    }
  }
  return [0, 0];
};

class PreviewRenderer {
  canvas: HTMLCanvasElement;
  copyShader: any;
  gl: ?WebGLRenderingContext;
  texture: any;
  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2;
    const opts = { preserveDrawingBuffer: true };
    const gl = canvas.getContext("webgl", opts);
    if (!gl) return;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    const texture = createTexture(gl, [2, 2]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0,
        -1.0,
        1.0,
        -1.0,
        -1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
      ]),
      gl.STATIC_DRAW
    );
    const copyShader = createShader(
      gl,
      `
attribute vec2 _p;
varying vec2 uv;
void main() {
  gl_Position = vec4(_p,0.0,1.0);
  uv = vec2(0.5, 0.5) * (_p+vec2(1.0, 1.0));
}
`,
      `
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  vec4 c = texture2D(t, uv);
  gl_FragColor = c;
}`
    );
    copyShader.bind();
    copyShader.attributes._p.pointer();
    this.copyShader = copyShader;
    this.texture = texture;
    this.canvas = canvas;
    this.gl = gl;
  }
  setSize(newWidth, newHeight) {
    const { gl, canvas, texture } = this;
    if (!gl) return;
    if (
      gl.drawingBufferWidth === newWidth &&
      gl.drawingBufferHeight === newHeight
    )
      return;
    texture.shape = [newWidth, newHeight];
    canvas.width = newWidth;
    canvas.height = newHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  draw(obj) {
    const { texture, gl, copyShader } = this;
    if (!gl) return;
    const [w, h] = inferSize(obj);
    if (!w || !h) return;
    this.setSize(w, h);
    texture.setPixels(obj);
    copyShader.uniforms.t = texture.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  copyToCanvas2D(ctx) {
    const { canvas } = this;
    ctx.canvas.width = canvas.width;
    ctx.canvas.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);
  }
}

class UniformValue extends Component {
  props: {
    id: string,
    node: Object,
    value: any,
    type: any,
    info: any,
  };
  render() {
    let { id, node, value, type, info } = this.props;
    if (type in primitiveTypeAlias) {
      type = primitiveTypeAlias[type];
    }
    return Array.isArray(type) ? (
      <span className={"value-array " + classType(type)}>
        {type.map((type, i) => (
          <UniformValue
            id={id + "[" + i + "]"}
            key={i}
            node={node}
            value={Array.isArray(value) ? value[i] : null}
            type={type}
            info={info && info[i]}
          />
        ))}
      </span>
    ) : (
      <span className={"value " + classType(type)}>
        <span className="val">
          {typeof value === "number" ? formatNumber(value) : String(value)}
        </span>
        {info ? <MetaInfo id={id} node={node} info={info} /> : null}
      </span>
    );
  }
}

class Btn extends Component {
  props: {
    onClick: ?() => void,
    children?: any,
  };
  render() {
    const { onClick, children } = this.props;
    return (
      <span
        className="btn"
        onClick={onClick}
        style={{
          opacity: onClick ? 1 : 0.5,
        }}
      >
        {children}
      </span>
    );
  }
}

/**
 * an anchor is the top-right Dot attached on a InspectorNode/Bus
 * it is the start of a connection to another node
 */
class Anchor extends Component {
  props: {
    id: number,
    drawCount: number,
  };
  drawHistoryDates: Array<number> = [];
  static contextTypes = {
    inspector: PropTypes.object.isRequired,
  };
  componentDidMount() {
    this.context.inspector.addAnchor(this.props.id, this);
  }
  UNSAFE_componentWillReceiveProps({ id, drawCount }) {
    if (id !== this.props.id) {
      this.context.inspector.removeAnchor(this.props.id, this);
      this.context.inspector.addAnchor(id, this);
    }
    for (let i = this.props.drawCount; i < drawCount; i++) {
      this.drawHistoryDates.push(Date.now());
      if (this.drawHistoryDates.length > 200) {
        this.drawHistoryDates.shift();
      }
    }
  }
  componentWillUnmount() {
    this.context.inspector.removeAnchor(this.props.id, this);
  }
  getDrawCountsForTimeWindow = (w: number) => {
    const now = Date.now();
    const { drawHistoryDates } = this;
    const values = [];
    for (let i = drawHistoryDates.length - 1; i > 0; i--) {
      const t = (now - drawHistoryDates[i]) / w;
      if (t > 1) break;
      values.push(t);
    }
    return values;
  };
  getXY = () => {
    const { root } = this.refs;
    const { top, left, height } = root.getBoundingClientRect();
    return [left, top + height / 2];
  };
  render() {
    return <span className="hook" ref="root" />;
  }
}

/**
 * AnchorHook is the dot shown at the left of a texture uniform.
 * It is the end of the connection with an Anchor.
 */
class AnchorHook extends Component {
  props: {
    id: string,
    nodeId: number,
    anchorId: number,
  };
  static contextTypes = {
    inspector: PropTypes.object.isRequired,
  };
  componentDidMount() {
    this.context.inspector.addAnchorHook(this.props.anchorId, this);
  }
  UNSAFE_componentWillReceiveProps({ anchorId }) {
    if (anchorId !== this.props.anchorId) {
      this.context.inspector.removeAnchorHook(this.props.anchorId, this);
      this.context.inspector.addAnchorHook(anchorId, this);
    }
  }
  componentWillUnmount() {
    this.context.inspector.removeAnchorHook(this.props.anchorId, this);
  }
  getId = () => {
    return this.props.id;
  };
  getNodeId = () => {
    return this.props.nodeId;
  };
  getAnchorId = () => {
    return this.props.anchorId;
  };
  getXY = () => {
    const { root } = this.refs;
    const { top, left, height } = root.getBoundingClientRect();
    return [left, top + height / 2];
  };
  render() {
    return <span className="anchor-hook" ref="root" />;
  }
}

class MetaInfo extends Component {
  props: {
    id: string,
    node: Object,
    info: {
      obj: ?Object,
      initialObj: ?Object,
      dependency: ?Object,
      textureOptions: ?Object,
    },
  };
  render() {
    const { id, info, node } = this.props;
    const { dependency, obj } = info;
    const isBackbuffer = obj === Uniform.Backbuffer;
    const isBackbufferFrom =
      obj && typeof obj === "object" && obj.type === "BackbufferFrom";
    return (
      <span className="meta-info">
        {dependency ? (
          <AnchorHook
            id={dependency.id + "_" + node.id + "_" + id}
            nodeId={node.id}
            anchorId={dependency.id}
          />
        ) : isBackbuffer ? (
          <AnchorHook
            id={"rec_" + node.id + "_" + id}
            nodeId={node.id}
            anchorId={node.id}
          />
        ) : isBackbufferFrom ? (
          <AnchorHook
            id={"bf_" + node.id + "_" + obj.node.id}
            nodeId={node.id}
            anchorId={obj.node.id}
          />
        ) : null}
        {dependency ? (
          dependency.getGLShortName()
        ) : isBackbuffer ? (
          "Backbuffer"
        ) : isBackbufferFrom ? (
          "BackbufferFrom"
        ) : typeof obj === "string" ? (
          <a href={obj} target="_blank" rel="noopener noreferrer">
            {obj}
          </a>
        ) : (
          formatObject(obj)
        )}
      </span>
    );
  }
}

const sharedRenderer = new PreviewRenderer();

class Preview extends Component {
  props: {
    capture: Function,
  };
  interval: number;
  canvas: ?HTMLCanvasElement;
  ctx: ?CanvasRenderingContext2D;
  UNSAFE_componentWillReceiveProps() {
    this.capture();
  }
  componentWillUnmount() {
    this.capture.cancel();
  }
  capture = throttle(() => {
    const { ctx } = this;
    if (!ctx) return;
    const { capture } = this.props;
    const snap = capture();
    if (snap) {
      sharedRenderer.draw(snap);
      sharedRenderer.copyToCanvas2D(ctx);
    }
  }, 100);
  onCanvasRef = (canvas) => {
    if (!canvas || this.ctx) return;
    const ctx = canvas.getContext("2d");
    if ("imageSmoothingEnabled" in ctx) {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
    }
    this.canvas = canvas;
    this.ctx = ctx;
    this.capture();
  };
  render() {
    return (
      <div className="preview">
        <canvas ref={this.onCanvasRef} />
      </div>
    );
  }
}

class PreviewNode extends PureComponent {
  props: {
    node: Object,
  };
  capture = () => {
    const { node } = this.props;
    try {
      return node.capture();
    } catch (e) {}
  };
  render() {
    return <Preview capture={this.capture} />;
  }
}

class PreviewContent extends Component {
  props: {
    content: Object,
  };
  capture = () => {
    const { content } = this.props;
    return content;
  };
  render() {
    return <Preview capture={this.capture} />;
  }
}

class DrawCount extends PureComponent {
  props: {
    drawCount: number,
  };
  render() {
    const { drawCount } = this.props;
    return <span className="drawCount">{drawCount}</span>;
  }
}

class InspectorBox extends Component {
  props: {
    animated: boolean,
    drawCount: number,
    cls: string,
    pos: [number, number],
    glObject: Bus | Node,
    mode?: any,
    width: number,
    height: number,
    children?: any,
    root?: boolean,
    grabbed?: boolean,
    minimized: boolean,
    onGrabStart: (id: number, e: MouseEvent) => void,
    onMinimizeChange: (id: number, minimized: boolean) => void,
  };
  static contextTypes = {
    inspector: PropTypes.object.isRequired,
  };
  state = {
    recentDraw: false,
  };
  lastDrawCountTime: number;
  _timeout: number;
  componentDidMount() {
    this.context.inspector.addBox(this.props.glObject.id, this);
    this.onNewDraw();
  }
  UNSAFE_componentWillReceiveProps({ drawCount, glObject: { id } }) {
    if (id !== this.props.glObject.id) {
      this.context.inspector.removeBox(id, this);
      this.context.inspector.addBox(id, this);
    }
    if (drawCount !== this.props.drawCount) {
      this.onNewDraw();
    }
  }
  componentWillUnmount() {
    clearTimeout(this._timeout);
    this.context.inspector.removeBox(this.props.glObject.id, this);
  }
  getSize() {
    const { width, height } = this.refs.box.getBoundingClientRect();
    return [width, height];
  }
  onNewDraw = () => {
    if (!this.state.recentDraw) {
      this.setState({ recentDraw: true }, () => {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => {
          if (this.state.recentDraw) {
            this.setState({ recentDraw: false });
          }
        }, 20);
      });
    }
  };
  onMouseDown = (e) => {
    e.preventDefault();
    this.props.onGrabStart(this.props.glObject.id, e);
  };
  onClickMinimize = (e) => {
    e.preventDefault();
    this.props.onMinimizeChange(this.props.glObject.id, !this.props.minimized);
  };
  onRedraw = () => this.props.glObject.redraw();
  render() {
    const { recentDraw } = this.state;
    const {
      pos,
      drawCount,
      glObject,
      width,
      height,
      mode,
      children,
      grabbed,
      cls,
      minimized,
    } = this.props;
    return (
      <div
        ref="box"
        style={{ left: pos[0], top: pos[1] }}
        className={
          "box" +
          (cls ? " " + cls : "") +
          (recentDraw ? " recent-draw" : "") +
          (grabbed ? " grabbed" : "") +
          (minimized ? " minimized" : "")
        }
      >
        <header onMouseDown={this.onMouseDown}>
          <Anchor id={glObject.id} drawCount={drawCount} />
          <span className="name">{glObject.getGLShortName()}</span>
          <span className="redraw" onClick={this.onRedraw}>
            <DrawCount drawCount={drawCount} />
          </span>
        </header>
        {children}
        <footer onClick={this.onClickMinimize}>
          <span className="minimize">↕</span>
          <span className="dim">
            {width}⨉{height}
          </span>
          <span className="mode">{mode}</span>
        </footer>
      </div>
    );
  }
}

const formatType = (t) => {
  if (Array.isArray(t)) return t[0] + "[]";
  return t;
};

class Uniforms extends PureComponent {
  props: {
    node: Object,
    preparedUniforms: ?Object,
  };
  render() {
    const { node, preparedUniforms } = this.props;
    return (
      <div className="uniforms">
        {preparedUniforms &&
          preparedUniforms.map((u) => (
            <div key={u.key} className={"uniform " + classType(u.type)}>
              <span
                className="name"
                title={"uniform " + formatType(u.type) + " " + u.key}
              >
                {u.key}
              </span>
              <span
                className={"value-container " + classType(u.type)}
                title={JSON.stringify(u.value)}
              >
                <UniformValue
                  id={u.key}
                  node={node}
                  value={u.value}
                  type={u.type}
                  info={u.getMetaInfo ? u.getMetaInfo() : null}
                />
              </span>
            </div>
          ))}
      </div>
    );
  }
}

class SVGConnectionLine extends PureComponent {
  props: {
    hookX: number,
    hookY: number,
    anchorX: number,
    anchorY: number,
    onPathRef: Function,
    reversedHook?: boolean,
    recursive?: boolean,
  };
  render() {
    const {
      anchorX,
      anchorY,
      hookX,
      hookY,
      recursive,
      onPathRef,
      reversedHook,
    } = this.props;
    const dx = hookX - anchorX;
    const dy = hookY - anchorY;
    const factor = Math.abs(dx) + Math.abs(dy);
    const t = Math.round((recursive ? 0.1 : 0.3) * factor);
    const s = Math.round((recursive ? 0.02 : 0.05) * factor, 8);
    return (
      <path
        ref={onPathRef}
        className="connection-line"
        d={
          `M${anchorX},${anchorY} ` +
          `L${anchorX + s},${anchorY} ` +
          `C${anchorX + t},${anchorY} ` +
          (recursive
            ? `${anchorX + t},${anchorY - anchorYOff} ` +
              `${anchorX + s},${anchorY - anchorYOff} ` +
              `L${hookX - s},${anchorY - anchorYOff} ` +
              `C${hookX - t},${anchorY - anchorYOff} `
            : "") +
          `${hookX - t * (reversedHook ? -1 : 1)},${hookY} ` +
          `${hookX - s * (reversedHook ? -1 : 1)},${hookY} ` +
          `L${hookX},${hookY}`
        }
      />
    );
  }
}

class SVGConnection extends Component {
  props: {
    anchor: Object,
    hookX: number,
    hookY: number,
    anchorX: number,
    anchorY: number,
    tension: number,
    solid: number,
    recursive?: boolean,
    reversedHook?: boolean,
    animated?: boolean,
  };
  state = {
    draws: [],
  };
  path: any;
  _raf: any;
  componentDidMount() {
    const { path } = this;
    const loop = () => {
      this._raf = raf(loop);
      if (!this.props.animated) return;
      const values = this.props.anchor.getDrawCountsForTimeWindow(
        drawTimeWindow
      );
      if (values.length === 0) {
        if (this.state.draws.length !== 0) {
          this.setState({ draws: [] });
        }
        return;
      }
      const length = path.getTotalLength();
      this.setState({
        draws: values.map((v) => {
          const { x, y } = path.getPointAtLength(v * length);
          return [x.toFixed(1), y.toFixed(1)]; // round is too aggressive and great jump. but using full float is also more consuming
        }),
      });
    };
    this._raf = raf(loop);
  }
  UNSAFE_componentWillReceiveProps({ animated }) {
    if (this.props.animated && !animated) {
      this.setState({ draws: [] });
    }
  }
  componentWillUnmount() {
    raf.cancel(this._raf);
  }
  onPathRef = (ref) => {
    this.path = ref;
  };
  render() {
    const {
      hookX,
      hookY,
      anchorX,
      anchorY,
      tension,
      solid,
      recursive,
      reversedHook,
    } = this.props;
    const { draws } = this.state;
    return (
      <g className="connection">
        <SVGConnectionLine
          onPathRef={this.onPathRef}
          anchorX={anchorX}
          anchorY={anchorY}
          hookX={hookX}
          hookY={hookY}
          tension={tension}
          solid={solid}
          recursive={recursive}
          reversedHook={reversedHook}
        />
        {draws.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} />
        ))}
      </g>
    );
  }
}

class SVGStandaloneConnection extends Component {
  props: {
    animated: boolean,
    anchor: Anchor,
    anchorX: number,
    anchorY: number,
    hookX: number,
    hookY: number,
  };
  render() {
    const { animated, anchor, anchorX, anchorY, hookX, hookY } = this.props;
    return (
      <g className="standalone-connection">
        <SVGConnection
          animated={animated}
          anchor={anchor}
          anchorX={anchorX}
          anchorY={anchorY}
          hookX={hookX}
          hookY={hookY}
          reversedHook
        />
        <circle className="standalone-output" cx={hookX} cy={hookY} />
      </g>
    );
  }
}

class HookDrawer extends Component {
  props: {
    animated: boolean,
    anchorHooksByAnchorId: *,
    anchorsById: *,
    anchorPositions: *,
    anchorHookPositions: *,
    boxSizes: *,
    grabbing: ?Object,
  };
  render() {
    const {
      animated,
      anchorHooksByAnchorId,
      anchorsById,
      anchorPositions,
      anchorHookPositions,
      boxSizes,
      grabbing,
    } = this.props;
    return (
      <svg ref="svg" className="hook-drawer">
        {[...anchorsById].map(([anchorId, anchor]) => {
          const hooks = anchorHooksByAnchorId.get(anchorId) || [];
          const anchorPosition = anchorPositions.get(anchorId);
          const size = boxSizes.get(anchorId);
          const anchorIsGrabbed = grabbing && grabbing.id === anchorId;
          if (!anchorPosition || !size) return null;
          return (
            <g
              className={"anchor-group" + (anchorIsGrabbed ? " grabbed" : "")}
              key={anchorId}
            >
              {hooks.length === 0 ? (
                <SVGStandaloneConnection
                  animated={animated}
                  anchor={anchor}
                  anchorX={anchorPosition[0]}
                  anchorY={anchorPosition[1]}
                  hookX={anchorPosition[0]}
                  hookY={anchorPosition[1] + size[1] - 22}
                />
              ) : (
                hooks.map((hook) => {
                  const hookId = hook.getId();
                  const hookNodeId = hook.getNodeId();
                  const hookIsGrabbed = grabbing && grabbing.id === hookNodeId;
                  const hookPosition = anchorHookPositions.get(hook);
                  if (!hookPosition) return null;
                  return (
                    <g
                      className={
                        "hook-group" + (hookIsGrabbed ? " grabbed" : "")
                      }
                      key={hookId}
                    >
                      <SVGConnection
                        animated={animated}
                        anchor={anchor}
                        anchorX={anchorPosition[0]}
                        anchorY={anchorPosition[1]}
                        hookX={hookPosition[0]}
                        hookY={hookPosition[1]}
                        recursive={hookNodeId === anchorId}
                      />
                      <circle
                        className="hook"
                        cx={hookPosition[0]}
                        cy={hookPosition[1]}
                      />
                    </g>
                  );
                })
              )}
              <circle
                className="anchor"
                cx={anchorPosition[0]}
                cy={anchorPosition[1]}
              />
            </g>
          );
        })}
      </svg>
    );
  }
}

const inspectorVisitorLogger = new VisitorLogger();

export default class Inspector extends Component {
  state = {
    capture: false,
    animated: true,
    physics: false,
    minimizeAll: false,
  };
  static childContextTypes = {
    inspector: PropTypes.object.isRequired,
  };
  getChildContext() {
    return { inspector: this };
  }

  // We don't use React state here for better perf.
  surface: ?Surface;
  preparedUniformsMap: WeakMap<Node, Object> = new WeakMap();
  nodeDrawCounts: WeakMap<Node, number> = new WeakMap();
  busDrawCounts: WeakMap<Bus, number> = new WeakMap();
  anchorsById: Map<number, Anchor> = new Map();
  anchorHooksByAnchorId: Map<number, Array<AnchorHook>> = new Map();
  boxesById: Map<number, InspectorBox> = new Map();

  // FIXME anchorPositions will become relative to nodePositions when it's stable
  anchorPositions: Map<number, [number, number]> = new Map();
  anchorHookPositions: Map<AnchorHook, [number, number]> = new Map();

  boxMinimized: Map<number, boolean> = new Map();
  boxPos: Map<number, [number, number]> = new Map();
  boxVel: Map<number, [number, number]> = new Map();
  boxAcc: Map<number, [number, number]> = new Map();
  boxSizes: Map<number, [number, number]> = new Map();
  _startupTimeout: number;
  _raf: any;
  grabbing: ?{
    id: number,
    initialPos: [number, number],
    initialEventPos: [number, number],
  };

  componentDidMount() {
    Visitors.add(this);
    this._startupTimeout = setTimeout(() => this.detectSurface(), 0);
    let lastT;
    const loop = (t) => {
      this._raf = raf(loop);
      if (!lastT) lastT = t;
      const delta = Math.min(100, t - lastT);
      lastT = t;
      const syncChanged = this.syncFromDom();
      const physicsChanged = this.state.physics && this.physicsStep(delta);
      if (syncChanged || physicsChanged) {
        this.forceUpdate();
      }
    };
    this._raf = raf(loop);
  }

  componentWillUnmount() {
    raf.cancel(this._raf);
    clearTimeout(this._startupTimeout);
    Visitors.remove(this);
  }

  setSurface(surface: ?Surface) {
    if (surface === this.surface) return;
    this.preparedUniformsMap = new WeakMap();
    this.surface = surface;
    if (surface) surface.rebootForDebug();
    this.forceUpdate();
  }

  detectSurface() {
    const surface = listSurfaces()[0];
    this.setSurface(surface);
  }

  onSurfaceMount() {
    if (!this.surface) {
      this.detectSurface();
    }
  }

  onSurfaceUnmount(surface: Surface) {
    if (surface === this.surface) {
      this.setSurface(null);
    }
  }

  onSurfaceGLContextChange() {}

  onSurfaceDrawSkipped() {}

  onSurfaceDrawStart() {}

  onSurfaceDrawError() {}

  onSurfaceDrawEnd(surface: Surface) {
    if (surface === this.surface) {
      this.forceUpdate();
    }
  }

  onNodeDrawSkipped() {}

  onNodeDrawStart() {}

  onNodeSyncDeps() {}

  onNodeDraw(node: Node, preparedUniforms: Object) {
    this.preparedUniformsMap.set(node, preparedUniforms);
  }

  onNodeDrawEnd(node: Node) {
    this.nodeDrawCounts.set(node, (this.nodeDrawCounts.get(node) || 0) + 1);
    node.dependencies.forEach((obj) => {
      if (obj instanceof Bus) {
        this.busDrawCounts.set(obj, (this.busDrawCounts.get(obj) || 0) + 1);
      }
    });
  }

  addAnchorHook(id: number, hook: AnchorHook) {
    let hooks = this.anchorHooksByAnchorId.get(id);
    if (!hooks) {
      this.anchorHooksByAnchorId.set(id, [hook]);
    } else {
      hooks.push(hook);
    }
    this.forceUpdate();
  }

  removeAnchorHook(id: number, hook: AnchorHook) {
    const hooks = this.anchorHooksByAnchorId.get(id);
    if (hooks) {
      const i = hooks.indexOf(hook);
      hooks.splice(i, 1);
      if (hooks.length === 0) {
        this.anchorHooksByAnchorId.delete(id);
      }
      this.forceUpdate();
    }
  }

  addAnchor(id: number, hook: Anchor) {
    this.anchorsById.set(id, hook);
    this.forceUpdate();
  }

  removeAnchor(id: number) {
    this.anchorsById.delete(id);
    this.forceUpdate();
  }

  addBox(id: number, box: InspectorBox) {
    this.boxesById.set(id, box);
    const i = this.boxPos.size;
    const pos = [
      // FIXME TMP
      60 + 240 * ((i + 1) % 2),
      40 + 200 * Math.floor(i / 2),
    ];
    this.boxPos.set(id, pos);
    this.boxMinimized.set(id, this.state.minimizeAll);
  }

  removeBox(id: number) {
    this.boxesById.delete(id);
    this.boxPos.delete(id);
    this.boxSizes.delete(id);
    this.boxMinimized.delete(id);
    this.boxVel.delete(id);
    this.boxAcc.delete(id);
  }

  bounds: any;
  syncFromDom() {
    const { nodes, body } = this.refs;
    let hasChanged = false;
    if (nodes) {
      this.bounds = body.getBoundingClientRect();
      const { top: offY, left: offX } = nodes.getBoundingClientRect();
      const {
        anchorsById,
        anchorPositions,
        anchorHooksByAnchorId,
        anchorHookPositions,
        boxesById,
        boxSizes,
      } = this;
      // FIXME only the Anchor and AnchorHook should be allow to "sync this"
      // as soon as we make this local position, not global...
      anchorsById.forEach((anchor, id) => {
        let [x, y] = anchor.getXY();
        x = Math.round(x - offX);
        y = Math.round(y - offY);
        const old = anchorPositions.get(id);
        if (!old || x !== old[0] || y !== old[1]) {
          hasChanged = true;
          anchorPositions.set(id, [x, y]);
        }
      });
      anchorHooksByAnchorId.forEach((anchorHooks) => {
        anchorHooks.forEach((anchorHook) => {
          let [x, y] = anchorHook.getXY();
          x = Math.round(x - offX);
          y = Math.round(y - offY);
          const old = anchorHookPositions.get(anchorHook);
          if (!old || x !== old[0] || y !== old[1]) {
            hasChanged = true;
            anchorHookPositions.set(anchorHook, [x, y]);
          }
        });
      });
      // FIXME: same, the box size should only be sync when InspectorBox did update/mount
      boxesById.forEach((box, id) => {
        const size = box.getSize();
        const old = boxSizes.get(id);
        if (!old || size[0] !== old[0] || size[1] !== old[1]) {
          hasChanged = true;
          boxSizes.set(id, size);
        }
      });
    }
    return hasChanged;
  }

  applyForce(id: * /* FIXME number|string !?*/, force: [number, number]) {
    const { boxAcc } = this;
    const mass = 1;
    const acc = boxAcc.get(id) || [0, 0];
    boxAcc.set(id, [acc[0] + force[0] / mass, acc[1] + force[1] / mass]);
  }

  spring() {
    // a bit inspired from https://github.com/dhotson/springy/blob/master/springy.js
    const {
      anchorPositions,
      anchorHookPositions,
      anchorsById,
      anchorHooksByAnchorId,
      boxPos,
      boxSizes,
    } = this;
    anchorsById.forEach((anchor, anchorId) => {
      const hooks = anchorHooksByAnchorId.get(anchorId) || [];
      const anchorPos = anchorPositions.get(anchorId);
      if (!anchorPos) return;
      hooks.forEach((hook) => {
        const hookId = hook.getId();
        const hookNodeId = hook.getNodeId();
        if (anchorId !== hookNodeId) {
          const hookPos = anchorHookPositions.get(hook);
          if (!hookPos) return;
          const dx = anchorPos[0] - hookPos[0];
          const dy = anchorPos[1] - hookPos[1];
          const magn = Math.sqrt(dx * dx + dy * dy);
          const dist = magn + 0.1;
          const dir = [dx / magn, dy / magn];
          // Coulombs law
          const m = 8 / (dist * dist);
          this.applyForce(anchorId, [m * dir[0], m * dir[1]]);
          this.applyForce(hookId, [-m * dir[0], -m * dir[1]]);
          // Hookes law
          const length = 1.0; // FIXME mysterious constant xD
          const disp = length - magn;
          const n = 0.5 * 0.00001 * disp;
          this.applyForce(hookId, [-n * dir[0], -n * dir[1]]);
          this.applyForce(anchorId, [n * dir[0], n * dir[1]]);
        }
      });
    });

    // a box push other boxes
    const boxIds = [...boxPos.keys()];
    for (let i = 0; i < boxIds.length; i++) {
      const box1id = boxIds[i];
      const box1pos = boxPos.get(box1id);
      const box1size = boxSizes.get(box1id);
      if (!box1size) continue;
      for (let j = i + 1; j < boxIds.length; j++) {
        const box2id = boxIds[j];
        const box2pos = boxPos.get(box2id);
        const box2size = boxSizes.get(box2id);
        if (!box2size || !box2pos || !box1pos) continue;
        const dx = box1pos[0] + box1size[0] / 2 - (box2pos[0] + box2size[0]);
        const dy = box1pos[1] + box1size[1] / 2 - (box2pos[1] + box2size[1]);
        const magn = Math.sqrt(dx * dx + dy * dy);
        const dist = magn + 0.1;
        const dir = [dx / magn, dy / magn];
        const m = 6 / (dist * dist);
        this.applyForce(box1id, [m * dir[0], m * dir[1]]);
        this.applyForce(box2id, [-m * dir[0], -m * dir[1]]);
      }
    }
  }

  updateVelocityPosition(timestep: number) {
    const { grabbing, boxPos, boxVel, boxAcc, bounds, boxSizes } = this;
    const damping = 0.5;
    const grabId = grabbing && grabbing.id;
    boxPos.forEach((p, id) => {
      if (id === grabId) return;
      let a = boxAcc.get(id) || [0, 0];
      let v = boxVel.get(id) || [0, 0];
      const size = boxSizes.get(id) || [0, 0];
      v = [
        (v[0] + a[0] * timestep) * damping,
        (v[1] + a[1] * timestep) * damping,
      ];
      p = [p[0] + v[0] * timestep, p[1] + v[1] * timestep];
      if (bounds) {
        const pad = 20;
        p[0] = Math.max(pad, Math.min(p[0], bounds.width - size[0] - pad));
        p[1] = Math.max(pad, Math.min(p[1], bounds.height - size[1] - pad));
      }

      a = [0, 0];
      boxVel.set(id, v);
      boxAcc.set(id, a);
      boxPos.set(id, p);
    });
  }

  physicsStep(timestep: number) {
    this.spring();
    this.updateVelocityPosition(timestep);
    var energy = 0.0;
    this.boxVel.forEach((v) => {
      energy += v[0] * v[0] + v[1] * v[1];
    });
    if (energy > 0.00001) {
      this.forceUpdate();
    }
  }

  onGrabStart = (id: number, e: MouseEvent) => {
    const boxPos = this.boxPos.get(id) || [0, 0];
    this.grabbing = {
      id,
      initialPos: boxPos,
      initialEventPos: [e.clientX, e.clientY],
    };
    this.forceUpdate();
  };

  onMouseMove = (e: MouseEvent) => {
    if (this.grabbing) {
      const { id, initialPos, initialEventPos } = this.grabbing;
      const dx = e.clientX - initialEventPos[0];
      const dy = e.clientY - initialEventPos[1];
      const pos = [initialPos[0] + dx, initialPos[1] + dy];
      this.boxPos.set(id, pos);
      this.forceUpdate(); // NB for better perf we should only make the box to update.. same for the physicsStep
    }
  };

  onMouseLeave = () => {
    if (this.grabbing) {
      this.grabbing = null;
      this.forceUpdate();
    }
  };

  onMouseUp = () => {
    if (this.grabbing) {
      this.grabbing = null;
      this.forceUpdate();
    }
  };

  onMinimizeChange = (id: number, minimized: boolean) => {
    this.boxMinimized.set(id, minimized);
    this.forceUpdate();
  };

  onCaptureChange = (e: *) => {
    this.setState({ capture: e.target.checked });
  };

  onAnimatedChange = (e: *) => {
    this.setState({ animated: e.target.checked });
  };

  onMinimizeAllChange = (e: *) => {
    const minimizeAll = e.target.checked;
    this.setState({ minimizeAll });
    const { boxPos, boxMinimized } = this;
    boxPos.forEach((p, id) => {
      boxMinimized.set(id, minimizeAll);
    });
  };

  onPhysicsChange = (e: *) => {
    this.setState({ physics: e.target.checked });
  };

  onSelectChange = (e: *) => {
    const { selectedIndex } = e.target;
    this.setSurface(
      selectedIndex === 0 ? undefined : listSurfaces()[selectedIndex - 1]
    );
  };

  rebootSurface = () => {
    const { surface } = this.state;
    if (surface) surface.rebootForDebug();
  };

  loseContextLatestExtension: any;
  loseContext = () => {
    const { surface } = this;
    if (surface) {
      const { gl } = surface;
      if (gl) {
        this.loseContextLatestExtension = gl.getExtension("WEBGL_lose_context");
        this.loseContextLatestExtension.loseContext();
      }
    }
    this.forceUpdate();
  };

  restoreContext = () => {
    const { loseContextLatestExtension } = this;
    if (loseContextLatestExtension) {
      loseContextLatestExtension.restoreContext();
      this.loseContextLatestExtension = null;
    }
    this.forceUpdate();
  };

  onVisitorLoggerChange = (e: *) => {
    Visitors.remove(inspectorVisitorLogger);
    if (e.target.checked) {
      Visitors.add(inspectorVisitorLogger);
    }
  };

  render() {
    const { surface, boxPos, grabbing } = this;
    const { capture, animated, minimizeAll, physics } = this.state;

    const key = surface && surface.id;
    let headerBody, body;

    if (surface) {
      const root = surface.root;
      const nodeElements = [];
      // when you over a graph line it should tell info about uniforms around the node?
      // when you over a uniform, it should bold the connected lines.

      if (root) {
        let stack: Array<Bus | Node> = [root];
        const explored = {};
        while (stack.length > 0) {
          const n: Node | Bus = stack.pop();
          const deps = n instanceof Node ? n.dependencies : [];
          stack = deps.concat(stack);
          const { id } = n;
          if (explored[id]) continue; // FIXME for some reason i can't yet figure out, it can't be before the stacking in advanced examples like Behind Asteroids
          explored[id] = true;
          const pos = boxPos.get(id) || [0, 0];
          const minimized = this.boxMinimized.get(id) || false;
          const props = {
            animated,
            key: id,
            pos,
            glObject: n,
            grabbed: grabbing ? grabbing.id === id : false,
            minimized,
            onMinimizeChange: this.onMinimizeChange,
            onGrabStart: this.onGrabStart,
          };
          if (n instanceof Node) {
            const [width, height] = n.getGLSize();
            const drawCount = this.nodeDrawCounts.get(n);
            nodeElements.push(
              <InspectorBox
                {...props}
                cls="node"
                drawCount={drawCount}
                width={width}
                height={height}
                mode={
                  n.framebuffer ? (minimized ? "fbo" : "framebuffer") : "canvas"
                }
              >
                <Uniforms
                  preparedUniforms={this.preparedUniformsMap.get(n)}
                  node={n}
                />
                {capture && !minimized ? (
                  <PreviewNode node={n} drawCount={drawCount} />
                ) : null}
              </InspectorBox>
            );
          } else {
            const content = n.getGLRenderableContent();
            const [width, height] = inferSize(content);
            const drawCount = this.busDrawCounts.get(n);
            nodeElements.push(
              <InspectorBox
                {...props}
                cls="bus"
                onPosChange={this.onPosChange}
                drawCount={drawCount}
                width={width}
                height={height}
                mode={String(content)}
              >
                <div className="content-html">
                  {(content && content.outerHTML) || null}
                </div>
                {capture && !minimized ? (
                  <PreviewContent content={content} />
                ) : null}
              </InspectorBox>
            );
          }
        }

        const lost = !surface.gl || this.loseContextLatestExtension;
        headerBody = [
          <div key="opts">
            <label>
              <input
                type="checkbox"
                checked={capture}
                onChange={this.onCaptureChange}
              />
              capture
            </label>
            <label>
              <input
                type="checkbox"
                checked={animated}
                onChange={this.onAnimatedChange}
              />
              animated
            </label>
            <label>
              <input
                type="checkbox"
                checked={minimizeAll}
                onChange={this.onMinimizeAllChange}
              />
              minimize
            </label>
            <label title="*physics is experimental. Help us improving it!">
              <input
                type="checkbox"
                checked={physics}
                onChange={this.onPhysicsChange}
              />
              physics*
            </label>
          </div>,
          lost ? (
            <Btn key="ctx" onClick={this.restoreContext}>
              restore GL context
            </Btn>
          ) : (
            <Btn key="ctx" onClick={this.loseContext}>
              lose GL context
            </Btn>
          ),
        ];
        body = (
          <div ref="body" className="body">
            <div ref="nodes" className="nodes">
              {nodeElements}
            </div>
            <HookDrawer
              animated={animated}
              anchorHooksByAnchorId={this.anchorHooksByAnchorId}
              anchorsById={this.anchorsById}
              anchorPositions={this.anchorPositions}
              anchorHookPositions={this.anchorHookPositions}
              boxSizes={this.boxSizes}
              grabbing={grabbing}
            />
          </div>
        );
      }
    } else {
      body = (
        <div className="body">
          <div className="no-surface">
            <h2>No Surface is currently inspected. Select one of these:</h2>
            <ul>
              {listSurfaces().map((surface) => (
                <li key={surface.id}>
                  <span onClick={() => this.setSurface(surface)}>
                    {surface.getGLName()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div
        key={key}
        ref="root"
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        className={"gl-react-inspector"}
      >
        <header>
          <div>
            <select
              value={surface ? surface.id : ""}
              onChange={this.onSelectChange}
            >
              <option value="">(none)</option>
              {listSurfaces().map((surface) => (
                <option key={surface.id} value={surface.id}>
                  {surface.getGLName()}
                </option>
              ))}
            </select>
            <label>
              <input
                type="checkbox"
                onChange={this.onVisitorLoggerChange}
                value={Visitors.get().indexOf(inspectorVisitorLogger) !== -1}
              />
              console logs
            </label>
          </div>
          {headerBody}
        </header>
        {body}
      </div>
    );
  }
}
