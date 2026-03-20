import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useReducer,
  memo,
} from "react";
import {
  CameraIcon,
  PlayIcon,
  PauseIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
  BoltSlashIcon,
  CommandLineIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import {
  Visitors,
  VisitorLogger,
  Node,
  Bus,
  Uniform,
  listSurfaces,
  Visitor,
} from "gl-react";
import type { Surface } from "gl-react";
import createTexture from "gl-texture2d";
import createShader from "gl-shader";
import throttle from "lodash/throttle";
import "./GLInspector.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const drawTimeWindow = 1000;
const anchorYOff = 30;

// ─── Utility Functions ───────────────────────────────────────────────────────

const formatNumber = (n: number): string => {
  const str = String(n);
  const i = str.indexOf(".");
  if (i === -1) return str;
  return str.slice(0, i + 1 + Math.max(1, 5 - i));
};

const formatObject = (o: unknown): string => {
  if (typeof o === "object") {
    const name =
      o && (o as { constructor?: { name?: string } }).constructor?.name;
    if (name) {
      return "[object " + String(name) + "]";
    }
  }
  return String(o);
};

const primitiveTypeAlias: Record<string, string[]> = {
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

const classType = (type: unknown): string => {
  if (Array.isArray(type)) return "type-array-" + type[0];
  return "type-" + type;
};

const inferSize = (obj: unknown): [number, number] => {
  if (obj) {
    const o = obj as Record<string, unknown>;
    if (o.shape) {
      return o.shape as [number, number];
    }
    if (o.videoWidth && o.videoHeight) {
      return [o.videoWidth as number, o.videoHeight as number];
    }
    if (o.width && o.height) {
      return [o.width as number, o.height as number];
    }
  }
  return [0, 0];
};

const formatType = (t: unknown): string => {
  if (Array.isArray(t)) return t[0] + "[]";
  return String(t);
};

// ─── PreviewRenderer ─────────────────────────────────────────────────────────

class PreviewRenderer {
  canvas: HTMLCanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  copyShader: any;
  gl: WebGLRenderingContext | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  texture: any;

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2;
    const opts = { preserveDrawingBuffer: true };
    const gl = canvas.getContext("webgl", opts) as WebGLRenderingContext | null;
    this.canvas = canvas;
    if (!gl) return;
    this.gl = gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    const texture = (createTexture as Function)(gl, [2, 2]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
      ]),
      gl.STATIC_DRAW,
    );
    const copyShader = (createShader as Function)(
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
}`,
    );
    copyShader.bind();
    copyShader.attributes._p.pointer();
    this.copyShader = copyShader;
    this.texture = texture;
  }

  setSize(newWidth: number, newHeight: number) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draw(obj: any) {
    const { texture, gl, copyShader } = this;
    if (!gl) return;
    const [w, h] = inferSize(obj);
    if (!w || !h) return;
    this.setSize(w, h);
    texture.setPixels(obj);
    copyShader.uniforms.t = texture.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  copyToCanvas2D(ctx: CanvasRenderingContext2D) {
    const { canvas } = this;
    ctx.canvas.width = canvas.width;
    ctx.canvas.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);
  }
}

const sharedRenderer = new PreviewRenderer();

// ─── Inspector Manager (non-React class) ─────────────────────────────────────

/**
 * AnchorRef holds a ref to the anchor DOM element and draw history data.
 * In the old code, Anchor was a React class component with instance methods.
 * Here we separate the data model from the rendering.
 */
interface AnchorRef {
  el: HTMLSpanElement | null;
  drawHistoryDates: number[];
  getDrawCountsForTimeWindow: (w: number) => number[];
  getXY: () => [number, number];
}

interface AnchorHookRef {
  el: HTMLSpanElement | null;
  id: string;
  nodeId: number;
  anchorId: number;
  getXY: () => [number, number];
}

interface BoxRef {
  el: HTMLDivElement | null;
  getSize: () => [number, number];
}

interface GrabbingState {
  id: number;
  initialPos: [number, number];
  initialEventPos: [number, number];
}

/**
 * InspectorManager holds all mutable state that the inspector uses.
 * It extends Visitor to hook into the gl-react draw lifecycle.
 * Components subscribe to changes via a forceUpdate trigger.
 */
class InspectorManager extends Visitor {
  surface: Surface | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preparedUniformsMap: WeakMap<Node, any> = new WeakMap();
  nodeDrawCounts: WeakMap<Node, number> = new WeakMap();
  busDrawCounts: WeakMap<Bus, number> = new WeakMap();
  anchorsById: Map<number, AnchorRef> = new Map();
  anchorHooksByAnchorId: Map<number, AnchorHookRef[]> = new Map();
  boxesById: Map<number, BoxRef> = new Map();

  anchorPositions: Map<number, [number, number]> = new Map();
  anchorHookPositions: Map<AnchorHookRef, [number, number]> = new Map();

  boxMinimized: Map<number, boolean> = new Map();
  boxPos: Map<number, [number, number]> = new Map();
  boxVel: Map<number, [number, number]> = new Map();
  boxAcc: Map<number, [number, number]> = new Map();
  boxSizes: Map<number, [number, number]> = new Map();
  grabbing: GrabbingState | null = null;
  bounds: DOMRect | null = null;

  _triggerUpdate: (() => void) | null = null;
  _minimizeAll = false;

  requestUpdate() {
    this._triggerUpdate?.();
  }

  setSurface(surface: Surface | null) {
    if (surface === this.surface) return;
    this.preparedUniformsMap = new WeakMap();
    this.surface = surface;
    if (surface) surface.rebootForDebug();
    this.requestUpdate();
  }

  detectSurface() {
    const surface = listSurfaces()[0];
    this.setSurface(surface ?? null);
  }

  // ─── Visitor methods ─────────────────────────────────────────────────

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
  onSurfaceDrawError() {
    return false;
  }

  onSurfaceDrawEnd(surface: Surface) {
    if (surface === this.surface) {
      this.requestUpdate();
    }
  }

  onNodeDrawSkipped() {}
  onNodeDrawStart() {}
  onNodeSyncDeps() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodeDraw(node: Node, preparedUniforms: any) {
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

  // ─── Anchor management ───────────────────────────────────────────────

  addAnchor(id: number, anchor: AnchorRef) {
    this.anchorsById.set(id, anchor);
    this.requestUpdate();
  }

  removeAnchor(id: number) {
    this.anchorsById.delete(id);
    this.requestUpdate();
  }

  addAnchorHook(id: number, hook: AnchorHookRef) {
    let hooks = this.anchorHooksByAnchorId.get(id);
    if (!hooks) {
      this.anchorHooksByAnchorId.set(id, [hook]);
    } else {
      hooks.push(hook);
    }
    this.requestUpdate();
  }

  removeAnchorHook(id: number, hook: AnchorHookRef) {
    const hooks = this.anchorHooksByAnchorId.get(id);
    if (hooks) {
      const i = hooks.indexOf(hook);
      if (i !== -1) hooks.splice(i, 1);
      if (hooks.length === 0) {
        this.anchorHooksByAnchorId.delete(id);
      }
      this.requestUpdate();
    }
  }

  // ─── Box management ──────────────────────────────────────────────────

  addBox(id: number, box: BoxRef) {
    this.boxesById.set(id, box);
    const i = this.boxPos.size;
    const pos: [number, number] = [
      60 + 240 * ((i + 1) % 2),
      40 + 200 * Math.floor(i / 2),
    ];
    this.boxPos.set(id, pos);
    this.boxMinimized.set(id, this._minimizeAll);
  }

  removeBox(id: number) {
    this.boxesById.delete(id);
    this.boxPos.delete(id);
    this.boxSizes.delete(id);
    this.boxMinimized.delete(id);
    this.boxVel.delete(id);
    this.boxAcc.delete(id);
  }

  // ─── DOM sync ────────────────────────────────────────────────────────

  syncFromDom(
    nodesEl: HTMLDivElement | null,
    bodyEl: HTMLDivElement | null,
  ): boolean {
    let hasChanged = false;
    if (nodesEl && bodyEl) {
      this.bounds = bodyEl.getBoundingClientRect();
      const { top: offY, left: offX } = nodesEl.getBoundingClientRect();

      this.anchorsById.forEach((anchor, id) => {
        const [x0, y0] = anchor.getXY();
        const x = Math.round(x0 - offX);
        const y = Math.round(y0 - offY);
        const old = this.anchorPositions.get(id);
        if (!old || x !== old[0] || y !== old[1]) {
          hasChanged = true;
          this.anchorPositions.set(id, [x, y]);
        }
      });

      this.anchorHooksByAnchorId.forEach((anchorHooks) => {
        anchorHooks.forEach((anchorHook) => {
          const [x0, y0] = anchorHook.getXY();
          const x = Math.round(x0 - offX);
          const y = Math.round(y0 - offY);
          const old = this.anchorHookPositions.get(anchorHook);
          if (!old || x !== old[0] || y !== old[1]) {
            hasChanged = true;
            this.anchorHookPositions.set(anchorHook, [x, y]);
          }
        });
      });

      this.boxesById.forEach((box, id) => {
        const size = box.getSize();
        const old = this.boxSizes.get(id);
        if (!old || size[0] !== old[0] || size[1] !== old[1]) {
          hasChanged = true;
          this.boxSizes.set(id, size);
        }
      });
    }
    return hasChanged;
  }

  // ─── Physics ─────────────────────────────────────────────────────────

  applyForce(id: number, force: [number, number]) {
    const mass = 1;
    const acc = this.boxAcc.get(id) || [0, 0];
    this.boxAcc.set(id, [
      acc[0] + force[0] / mass,
      acc[1] + force[1] / mass,
    ]);
  }

  spring() {
    this.anchorsById.forEach((anchor, anchorId) => {
      const hooks = this.anchorHooksByAnchorId.get(anchorId) || [];
      const anchorPos = this.anchorPositions.get(anchorId);
      if (!anchorPos) return;
      hooks.forEach((hook) => {
        const hookNodeId = hook.nodeId;
        if (anchorId !== hookNodeId) {
          const hookPos = this.anchorHookPositions.get(hook);
          if (!hookPos) return;
          const dx = anchorPos[0] - hookPos[0];
          const dy = anchorPos[1] - hookPos[1];
          const magn = Math.sqrt(dx * dx + dy * dy);
          const dist = magn + 0.1;
          const dir: [number, number] = [dx / magn, dy / magn];
          const m = 8 / (dist * dist);
          this.applyForce(anchorId, [m * dir[0], m * dir[1]]);
          this.applyForce(hookNodeId, [-m * dir[0], -m * dir[1]]);
          const length = 1.0;
          const disp = length - magn;
          const n = 0.5 * 0.00001 * disp;
          this.applyForce(hookNodeId, [-n * dir[0], -n * dir[1]]);
          this.applyForce(anchorId, [n * dir[0], n * dir[1]]);
        }
      });
    });

    const boxIds = [...this.boxPos.keys()];
    for (let i = 0; i < boxIds.length; i++) {
      const box1id = boxIds[i];
      const box1pos = this.boxPos.get(box1id);
      const box1size = this.boxSizes.get(box1id);
      if (!box1size) continue;
      for (let j = i + 1; j < boxIds.length; j++) {
        const box2id = boxIds[j];
        const box2pos = this.boxPos.get(box2id);
        const box2size = this.boxSizes.get(box2id);
        if (!box2size || !box2pos || !box1pos) continue;
        const dx =
          box1pos[0] +
          box1size[0] / 2 -
          (box2pos[0] + box2size[0]);
        const dy =
          box1pos[1] +
          box1size[1] / 2 -
          (box2pos[1] + box2size[1]);
        const magn = Math.sqrt(dx * dx + dy * dy);
        const dist = magn + 0.1;
        const dir: [number, number] = [dx / magn, dy / magn];
        const m = 6 / (dist * dist);
        this.applyForce(box1id, [m * dir[0], m * dir[1]]);
        this.applyForce(box2id, [-m * dir[0], -m * dir[1]]);
      }
    }
  }

  updateVelocityPosition(timestep: number) {
    const damping = 0.5;
    const grabId = this.grabbing?.id;
    this.boxPos.forEach((p, id) => {
      if (id === grabId) return;
      const a = this.boxAcc.get(id) || [0, 0];
      let v = this.boxVel.get(id) || [0, 0];
      const size = this.boxSizes.get(id) || [0, 0];
      v = [
        (v[0] + a[0] * timestep) * damping,
        (v[1] + a[1] * timestep) * damping,
      ];
      const newP: [number, number] = [
        p[0] + v[0] * timestep,
        p[1] + v[1] * timestep,
      ];
      if (this.bounds) {
        const pad = 20;
        newP[0] = Math.max(
          pad,
          Math.min(newP[0], this.bounds.width - size[0] - pad),
        );
        newP[1] = Math.max(
          pad,
          Math.min(newP[1], this.bounds.height - size[1] - pad),
        );
      }
      this.boxVel.set(id, v);
      this.boxAcc.set(id, [0, 0]);
      this.boxPos.set(id, newP);
    });
  }

  physicsStep(timestep: number): boolean {
    this.spring();
    this.updateVelocityPosition(timestep);
    let energy = 0.0;
    this.boxVel.forEach((v) => {
      energy += v[0] * v[0] + v[1] * v[1];
    });
    return energy > 0.00001;
  }
}

// ─── React Context ───────────────────────────────────────────────────────────

const InspectorContext = createContext<InspectorManager | null>(null);

function useInspector(): InspectorManager {
  const ctx = useContext(InspectorContext);
  if (!ctx) throw new Error("useInspector must be used within GLInspector");
  return ctx;
}

// ─── Small Components ────────────────────────────────────────────────────────

function Btn({
  onClick,
  children,
}: {
  onClick?: (() => void) | null;
  children?: React.ReactNode;
}) {
  return (
    <span
      className="btn"
      onClick={onClick ?? undefined}
      style={{ opacity: onClick ? 1 : 0.5 }}
    >
      {children}
    </span>
  );
}

// ─── Anchor ──────────────────────────────────────────────────────────────────

function Anchor({
  id,
  drawCount,
}: {
  id: number;
  drawCount: number;
}) {
  const mgr = useInspector();
  const elRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<AnchorRef | null>(null);
  const prevDrawCountRef = useRef(drawCount);

  // Create and register the anchor ref object once
  useEffect(() => {
    const anchor: AnchorRef = {
      el: null,
      drawHistoryDates: [],
      getDrawCountsForTimeWindow(w: number) {
        const now = Date.now();
        const values: number[] = [];
        for (let i = anchor.drawHistoryDates.length - 1; i > 0; i--) {
          const t = (now - anchor.drawHistoryDates[i]) / w;
          if (t > 1) break;
          values.push(t);
        }
        return values;
      },
      getXY() {
        if (!anchor.el) return [0, 0];
        const { top, left, height } = anchor.el.getBoundingClientRect();
        return [left, top + height / 2];
      },
    };
    anchorRef.current = anchor;
    mgr.addAnchor(id, anchor);
    return () => {
      mgr.removeAnchor(id);
    };
  }, [id, mgr]);

  // Sync the DOM element ref
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.el = elRef.current;
    }
  });

  // Track draw count changes
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    for (let i = prevDrawCountRef.current; i < drawCount; i++) {
      anchor.drawHistoryDates.push(Date.now());
      if (anchor.drawHistoryDates.length > 200) {
        anchor.drawHistoryDates.shift();
      }
    }
    prevDrawCountRef.current = drawCount;
  }, [drawCount]);

  return <span className="hook" ref={elRef} />;
}

// ─── AnchorHook ──────────────────────────────────────────────────────────────

function AnchorHook({
  id,
  nodeId,
  anchorId,
}: {
  id: string;
  nodeId: number;
  anchorId: number;
}) {
  const mgr = useInspector();
  const elRef = useRef<HTMLSpanElement>(null);
  const hookRef = useRef<AnchorHookRef | null>(null);

  useEffect(() => {
    const hook: AnchorHookRef = {
      el: null,
      id,
      nodeId,
      anchorId,
      getXY() {
        if (!hook.el) return [0, 0];
        const { top, left, height } = hook.el.getBoundingClientRect();
        return [left, top + height / 2];
      },
    };
    hookRef.current = hook;
    mgr.addAnchorHook(anchorId, hook);
    return () => {
      mgr.removeAnchorHook(anchorId, hook);
    };
  }, [id, nodeId, anchorId, mgr]);

  // Sync the DOM element ref
  useEffect(() => {
    if (hookRef.current) {
      hookRef.current.el = elRef.current;
    }
  });

  return <span className="anchor-hook" ref={elRef} />;
}

// ─── MetaInfo ────────────────────────────────────────────────────────────────

interface MetaInfoData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialObj?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependency?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textureOptions?: any;
}

function MetaInfo({
  id,
  node,
  info,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any;
  info: MetaInfoData;
}) {
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

// ─── UniformValue ────────────────────────────────────────────────────────────

function UniformValue({
  id,
  node,
  value,
  type,
  info,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any;
}) {
  let resolvedType = type;
  if (typeof resolvedType === "string" && resolvedType in primitiveTypeAlias) {
    resolvedType = primitiveTypeAlias[resolvedType];
  }
  if (Array.isArray(resolvedType)) {
    return (
      <span className={"value-array " + classType(resolvedType)}>
        {resolvedType.map((t: string, i: number) => (
          <UniformValue
            id={id + "[" + i + "]"}
            key={i}
            node={node}
            value={Array.isArray(value) ? value[i] : null}
            type={t}
            info={info && info[i]}
          />
        ))}
      </span>
    );
  }
  return (
    <span className={"value " + classType(resolvedType)}>
      <span className="val">
        {typeof value === "number" ? formatNumber(value) : String(value)}
      </span>
      {info ? <MetaInfo id={id} node={node} info={info} /> : null}
    </span>
  );
}

// ─── Uniforms ────────────────────────────────────────────────────────────────

const Uniforms = memo(function Uniforms({
  node,
  preparedUniforms,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preparedUniforms: any[] | null | undefined;
}) {
  return (
    <div className="uniforms">
      {preparedUniforms &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preparedUniforms.map((u: any) => (
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
});

// ─── Preview ─────────────────────────────────────────────────────────────────

function Preview({ capture }: { capture: () => unknown }) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const doCapture = useRef(
    throttle(() => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const snap = capture();
      if (snap) {
        sharedRenderer.draw(snap);
        sharedRenderer.copyToCanvas2D(ctx);
      }
    }, 100),
  ).current;

  // Re-capture whenever the component renders (props changed)
  useEffect(() => {
    doCapture();
  });

  useEffect(() => {
    return () => {
      doCapture.cancel();
    };
  }, [doCapture]);

  const onCanvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || ctxRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctxRef.current = ctx;
      doCapture();
    },
    [doCapture],
  );

  return (
    <div className="preview">
      <canvas ref={onCanvasRef} />
    </div>
  );
}

function PreviewNode({ node }: { node: Node }) {
  const capture = useCallback(() => {
    try {
      return node.capture();
    } catch (_e) {
      return undefined;
    }
  }, [node]);
  return <Preview capture={capture} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PreviewContent({ content }: { content: any }) {
  const capture = useCallback(() => content, [content]);
  return <Preview capture={capture} />;
}

// ─── DrawCount ───────────────────────────────────────────────────────────────

const DrawCount = memo(function DrawCount({
  drawCount,
}: {
  drawCount: number;
}) {
  return <span className="drawCount">{drawCount}</span>;
});

// ─── InspectorBox ────────────────────────────────────────────────────────────

function InspectorBox({
  animated: _animated,
  drawCount,
  cls,
  pos,
  glObject,
  mode,
  width,
  height,
  children,
  grabbed,
  minimized,
  onGrabStart,
  onMinimizeChange,
}: {
  animated: boolean;
  drawCount: number;
  cls: string;
  pos: [number, number];
  glObject: Bus | Node;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mode?: any;
  width: number;
  height: number;
  children?: React.ReactNode;
  grabbed?: boolean;
  minimized: boolean;
  onGrabStart: (id: number, e: React.MouseEvent) => void;
  onMinimizeChange: (id: number, minimized: boolean) => void;
}) {
  const mgr = useInspector();
  const boxElRef = useRef<HTMLDivElement>(null);
  const [recentDraw, setRecentDraw] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const prevDrawCountRef = useRef(drawCount);

  // Register box
  useEffect(() => {
    const boxRef: BoxRef = {
      el: null,
      getSize() {
        if (!boxElRef.current) return [0, 0];
        const { width: w, height: h } =
          boxElRef.current.getBoundingClientRect();
        return [w, h];
      },
    };
    mgr.addBox(glObject.id, boxRef);
    return () => {
      mgr.removeBox(glObject.id);
    };
  }, [glObject.id, mgr]);

  // Sync the DOM ref into the boxRef
  useEffect(() => {
    const box = mgr.boxesById.get(glObject.id);
    if (box) {
      box.el = boxElRef.current;
    }
  });

  // Handle new draws
  useEffect(() => {
    if (drawCount !== prevDrawCountRef.current) {
      prevDrawCountRef.current = drawCount;
      setRecentDraw(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setRecentDraw(false), 20);
    }
  }, [drawCount]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onGrabStart(glObject.id, e);
    },
    [glObject.id, onGrabStart],
  );

  const onClickMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onMinimizeChange(glObject.id, !minimized);
    },
    [glObject.id, minimized, onMinimizeChange],
  );

  const onRedraw = useCallback(() => {
    (glObject as Node).redraw?.();
  }, [glObject]);

  const className = [
    "box",
    cls,
    recentDraw && "recent-draw",
    grabbed && "grabbed",
    minimized && "minimized",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={boxElRef}
      style={{ left: pos[0], top: pos[1] }}
      className={className}
    >
      <header onMouseDown={onMouseDown}>
        <Anchor id={glObject.id} drawCount={drawCount} />
        <span className="name">{glObject.getGLShortName()}</span>
        <span className="redraw" onClick={onRedraw}>
          <DrawCount drawCount={drawCount} />
        </span>
      </header>
      {children}
      <footer onClick={onClickMinimize}>
        <span className="minimize">{"\u2195"}</span>
        <span className="dim">
          {width}
          {"\u2A09"}
          {height}
        </span>
        <span className="mode">{mode}</span>
      </footer>
    </div>
  );
}

// ─── SVG Connection Components ───────────────────────────────────────────────

// Cubic bezier evaluation at parameter t
function cubicBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return [
    uu * u * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + tt * t * p3[0],
    uu * u * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + tt * t * p3[1],
  ];
}

function lerp(t: number, a: [number, number], b: [number, number]): [number, number] {
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}

// Build path segments as evaluable functions + SVG d string
function buildPath(
  anchorX: number,
  anchorY: number,
  hookX: number,
  hookY: number,
  recursive?: boolean,
  reversedHook?: boolean,
) {
  const dx = hookX - anchorX;
  const dy = hookY - anchorY;
  const factor = Math.abs(dx) + Math.abs(dy);
  const ct = Math.round((recursive ? 0.1 : 0.3) * factor);
  const s = Math.round((recursive ? 0.02 : 0.05) * factor);
  const rh = reversedHook ? -1 : 1;

  const d =
    `M${anchorX},${anchorY} ` +
    `L${anchorX + s},${anchorY} ` +
    `C${anchorX + ct},${anchorY} ` +
    (recursive
      ? `${anchorX + ct},${anchorY - anchorYOff} ` +
        `${anchorX + s},${anchorY - anchorYOff} ` +
        `L${hookX - s},${anchorY - anchorYOff} ` +
        `C${hookX - ct},${anchorY - anchorYOff} `
      : "") +
    `${hookX - ct * rh},${hookY} ` +
    `${hookX - s * rh},${hookY} ` +
    `L${hookX},${hookY}`;

  // Build segments for parametric evaluation
  type Seg = { len: number; eval: (t: number) => [number, number] };
  const segs: Seg[] = [];

  const p0: [number, number] = [anchorX, anchorY];
  const p1: [number, number] = [anchorX + s, anchorY];
  segs.push({ len: Math.abs(s), eval: (t) => lerp(t, p0, p1) });

  if (recursive) {
    const c1s: [number, number] = [anchorX + s, anchorY];
    const c1c1: [number, number] = [anchorX + ct, anchorY];
    const c1c2: [number, number] = [anchorX + ct, anchorY - anchorYOff];
    const c1e: [number, number] = [anchorX + s, anchorY - anchorYOff];
    segs.push({ len: factor * 0.4, eval: (t) => cubicBezier(t, c1s, c1c1, c1c2, c1e) });

    const l2s: [number, number] = [anchorX + s, anchorY - anchorYOff];
    const l2e: [number, number] = [hookX - s, anchorY - anchorYOff];
    segs.push({ len: Math.abs(hookX - s - anchorX - s), eval: (t) => lerp(t, l2s, l2e) });

    const c2s: [number, number] = [hookX - s, anchorY - anchorYOff];
    const c2c1: [number, number] = [hookX - ct, anchorY - anchorYOff];
    const c2c2: [number, number] = [hookX - ct * rh, hookY];
    const c2e: [number, number] = [hookX - s * rh, hookY];
    segs.push({ len: factor * 0.4, eval: (t) => cubicBezier(t, c2s, c2c1, c2c2, c2e) });
  } else {
    const cs: [number, number] = [anchorX + s, anchorY];
    const cc1: [number, number] = [anchorX + ct, anchorY];
    const cc2: [number, number] = [hookX - ct * rh, hookY];
    const ce: [number, number] = [hookX - s * rh, hookY];
    segs.push({ len: factor * 0.6, eval: (t) => cubicBezier(t, cs, cc1, cc2, ce) });
  }

  const pEnd: [number, number] = [hookX - s * rh, hookY];
  const pFinal: [number, number] = [hookX, hookY];
  segs.push({ len: Math.abs(s), eval: (t) => lerp(t, pEnd, pFinal) });

  const totalLen = segs.reduce((a, s) => a + Math.max(s.len, 1), 0);

  function evalAt(u: number): [number, number] {
    let remaining = u * totalLen;
    for (const seg of segs) {
      const sl = Math.max(seg.len, 1);
      if (remaining <= sl) return seg.eval(remaining / sl);
      remaining -= sl;
    }
    return pFinal;
  }

  return { d, evalAt };
}

function SVGConnection({
  anchor,
  hookX,
  hookY,
  anchorX,
  anchorY,
  recursive,
  reversedHook,
  animated,
}: {
  anchor: AnchorRef;
  hookX: number;
  hookY: number;
  anchorX: number;
  anchorY: number;
  recursive?: boolean;
  reversedHook?: boolean;
  animated?: boolean;
}) {
  const [dots, setDots] = useState<[number, number][]>([]);
  const rafRef = useRef(0);
  const path = buildPath(anchorX, anchorY, hookX, hookY, recursive, reversedHook);

  useEffect(() => {
    if (!animated) {
      setDots([]);
      return;
    }
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const values = anchor.getDrawCountsForTimeWindow(drawTimeWindow);
      if (values.length === 0) {
        setDots((prev) => (prev.length ? [] : prev));
        return;
      }
      setDots(values.map((v) => path.evalAt(v)));
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [anchor, animated, path.d]);

  return (
    <g className="connection">
      <path className="connection-line" d={path.d} />
      {dots.map(([x, y], i) => (
        <circle key={i} className="connection-dot" cx={x} cy={y} r="1.5" />
      ))}
    </g>
  );
}

function SVGStandaloneConnection({
  animated,
  anchor,
  anchorX,
  anchorY,
  hookX,
  hookY,
}: {
  animated: boolean;
  anchor: AnchorRef;
  anchorX: number;
  anchorY: number;
  hookX: number;
  hookY: number;
}) {
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

// ─── HookDrawer ──────────────────────────────────────────────────────────────

function HookDrawer({
  animated,
  anchorHooksByAnchorId,
  anchorsById,
  anchorPositions,
  anchorHookPositions,
  boxSizes,
  grabbing,
}: {
  animated: boolean;
  anchorHooksByAnchorId: Map<number, AnchorHookRef[]>;
  anchorsById: Map<number, AnchorRef>;
  anchorPositions: Map<number, [number, number]>;
  anchorHookPositions: Map<AnchorHookRef, [number, number]>;
  boxSizes: Map<number, [number, number]>;
  grabbing: GrabbingState | null;
}) {
  return (
    <svg className="hook-drawer">
      {[...anchorsById].map(([anchorId, anchor]) => {
        const hooks = anchorHooksByAnchorId.get(anchorId) || [];
        const anchorPosition = anchorPositions.get(anchorId);
        const size = boxSizes.get(anchorId);
        const anchorIsGrabbed = grabbing?.id === anchorId;
        if (!anchorPosition || !size) return null;
        return (
          <g
            className={
              "anchor-group" + (anchorIsGrabbed ? " grabbed" : "")
            }
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
                const hookId = hook.id;
                const hookNodeId = hook.nodeId;
                const hookIsGrabbed = grabbing?.id === hookNodeId;
                const hookPosition = anchorHookPositions.get(hook);
                if (!hookPosition) return null;
                return (
                  <g
                    className={
                      "hook-group" +
                      (hookIsGrabbed ? " grabbed" : "")
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

// ─── GLInspector (main component) ────────────────────────────────────────────

const inspectorVisitorLogger = new VisitorLogger();

export default function GLInspector() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [capture, setCapture] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [physics, setPhysics] = useState(true);
  const [minimizeAll, setMinimizeAll] = useState(false);

  const mgrRef = useRef<InspectorManager | null>(null);
  if (!mgrRef.current) {
    mgrRef.current = new InspectorManager();
  }
  const mgr = mgrRef.current;

  const nodesRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const loseContextExtRef = useRef<WEBGL_lose_context | null>(null);

  // Wire up the forceUpdate trigger
  useEffect(() => {
    mgr._triggerUpdate = forceUpdate;
    return () => {
      mgr._triggerUpdate = null;
    };
  }, [mgr]);

  // Register as visitor and start animation loop
  useEffect(() => {
    Visitors.add(mgr);
    const startupTimeout = setTimeout(() => mgr.detectSurface(), 0);

    let lastT: number | undefined;
    let rafId: number;
    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      if (!lastT) lastT = t;
      const delta = Math.min(100, t - lastT);
      lastT = t;
      const syncChanged = mgr.syncFromDom(nodesRef.current, bodyRef.current);
      const physicsChanged = physics && mgr.physicsStep(delta);
      if (syncChanged || physicsChanged) {
        forceUpdate();
      }
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(startupTimeout);
      Visitors.remove(mgr);
    };
    // physics is intentionally captured by this effect so we get the latest
    // value. The effect re-runs when physics changes which is fine.
  }, [mgr, physics]);

  // ─── Event handlers ────────────────────────────────────────────────

  const onGrabStart = useCallback(
    (id: number, e: React.MouseEvent) => {
      const boxPos = mgr.boxPos.get(id) || [0, 0];
      mgr.grabbing = {
        id,
        initialPos: boxPos,
        initialEventPos: [e.clientX, e.clientY],
      };
      forceUpdate();
    },
    [mgr],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (mgr.grabbing) {
        const { id, initialPos, initialEventPos } = mgr.grabbing;
        const dx = e.clientX - initialEventPos[0];
        const dy = e.clientY - initialEventPos[1];
        const pos: [number, number] = [initialPos[0] + dx, initialPos[1] + dy];
        mgr.boxPos.set(id, pos);
        forceUpdate();
      }
    },
    [mgr],
  );

  const onMouseLeave = useCallback(() => {
    if (mgr.grabbing) {
      mgr.grabbing = null;
      forceUpdate();
    }
  }, [mgr]);

  const onMouseUp = useCallback(() => {
    if (mgr.grabbing) {
      mgr.grabbing = null;
      forceUpdate();
    }
  }, [mgr]);

  const onMinimizeChange = useCallback(
    (id: number, min: boolean) => {
      mgr.boxMinimized.set(id, min);
      forceUpdate();
    },
    [mgr],
  );

  const onSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { selectedIndex } = e.target;
      mgr.setSurface(
        selectedIndex === 0 ? null : listSurfaces()[selectedIndex - 1] ?? null,
      );
    },
    [mgr],
  );

  const loseContext = useCallback(() => {
    const { surface } = mgr;
    if (surface) {
      const { gl } = surface;
      if (gl) {
        loseContextExtRef.current = gl.getExtension("WEBGL_lose_context");
        loseContextExtRef.current?.loseContext();
      }
    }
    forceUpdate();
  }, [mgr]);

  const restoreContext = useCallback(() => {
    loseContextExtRef.current?.restoreContext();
    loseContextExtRef.current = null;
    forceUpdate();
  }, []);

  const [consoleLogsOn, setConsoleLogsOn] = useState(false);
  const onVisitorLoggerChange = useCallback(() => {
    setConsoleLogsOn((prev) => {
      const next = !prev;
      Visitors.remove(inspectorVisitorLogger);
      if (next) Visitors.add(inspectorVisitorLogger);
      return next;
    });
  }, []);

  // ─── Render ────────────────────────────────────────────────────────

  const { surface, boxPos, grabbing } = mgr;
  const key = surface?.id;

  let headerBody: React.ReactNode = null;
  let body: React.ReactNode = null;

  if (surface) {
    const root = surface.root;
    const nodeElements: React.ReactNode[] = [];

    if (root) {
      let stack: Array<Bus | Node> = [root];
      const explored: Record<number, boolean> = {};
      while (stack.length > 0) {
        const n = stack.pop()!;
        const deps = n instanceof Node ? n.dependencies : [];
        stack = deps.concat(stack);
        const { id } = n;
        if (explored[id]) continue;
        explored[id] = true;
        const pos = boxPos.get(id) || ([0, 0] as [number, number]);
        const boxMinimized = mgr.boxMinimized.get(id) || false;
        const sharedProps = {
          animated,
          pos,
          glObject: n,
          grabbed: grabbing ? grabbing.id === id : false,
          minimized: boxMinimized,
          onMinimizeChange,
          onGrabStart,
        };
        if (n instanceof Node) {
          const [w, h] = n.getGLSize();
          const drawCount = mgr.nodeDrawCounts.get(n) ?? 0;
          nodeElements.push(
            <InspectorBox
              key={id}
              {...sharedProps}
              cls="node"
              drawCount={drawCount}
              width={w}
              height={h}
              mode={
                n.framebuffer
                  ? boxMinimized
                    ? "fbo"
                    : "framebuffer"
                  : "canvas"
              }
            >
              <Uniforms
                preparedUniforms={mgr.preparedUniformsMap.get(n)}
                node={n}
              />
              {capture && !boxMinimized ? (
                <PreviewNode node={n} drawCount={drawCount} />
              ) : null}
            </InspectorBox>,
          );
        } else {
          const content = (n as Bus).getGLRenderableContent();
          const [w, h] = inferSize(content);
          const drawCount = mgr.busDrawCounts.get(n as Bus) ?? 0;
          nodeElements.push(
            <InspectorBox
              key={id}
              {...sharedProps}
              cls="bus"
              drawCount={drawCount}
              width={w}
              height={h}
              mode={String(content)}
            >
              <div className="content-html">
                {(content && content.outerHTML) || null}
              </div>
              {capture && !boxMinimized ? (
                <PreviewContent content={content} />
              ) : null}
            </InspectorBox>,
          );
        }
      }

      const lost = !surface.gl || loseContextExtRef.current;
      headerBody = (
        <>
          <button
            onClick={() => setCapture((v) => !v)}
            className={`p-1.5 rounded transition-colors ${capture ? 'bg-gray-400/30 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
            title={capture ? "Disable capture" : "Enable capture"}
          >
            <CameraIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setAnimated((v) => !v)}
            className={`p-1.5 rounded transition-colors ${animated ? 'bg-gray-400/30 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
            title={animated ? "Pause animation" : "Resume animation"}
          >
            {animated ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              const next = !minimizeAll;
              setMinimizeAll(next);
              mgr.boxPos.forEach((_, id) => mgr.boxMinimized.set(id, next));
            }}
            className={`p-1.5 rounded transition-colors ${minimizeAll ? 'bg-gray-400/30 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
            title={minimizeAll ? "Expand all" : "Minimize all"}
          >
            {minimizeAll ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setPhysics((v) => !v)}
            className={`p-1.5 rounded transition-colors ${physics ? 'bg-gray-400/30 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
            title={physics ? "Disable physics" : "Enable physics"}
          >
            {physics ? <BoltIcon className="h-4 w-4" /> : <BoltSlashIcon className="h-4 w-4" />}
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          {lost ? (
            <button onClick={restoreContext} className="p-1.5 rounded text-green-600 hover:text-green-700 transition-colors" title="Restore GL context">
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={loseContext} className="p-1.5 rounded text-gray-400 hover:text-red-500 transition-colors" title="Lose GL context">
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </>
      );

      body = (
        <div
          ref={bodyRef}
          className="body"
          style={{
            flex: 1,
            background: "#f3f3f3",
            overflow: "auto",
            display: "flex",
            position: "relative",
            flexDirection: "column",
          }}
        >
          <div ref={nodesRef} className="nodes">
            {nodeElements}
          </div>
          <HookDrawer
            animated={animated}
            anchorHooksByAnchorId={mgr.anchorHooksByAnchorId}
            anchorsById={mgr.anchorsById}
            anchorPositions={mgr.anchorPositions}
            anchorHookPositions={mgr.anchorHookPositions}
            boxSizes={mgr.boxSizes}
            grabbing={grabbing}
          />
        </div>
      );
    }
  } else {
    body = (
      <div
        className="body"
        style={{
          flex: 1,
          background: "#f3f3f3",
          overflow: "auto",
          display: "flex",
          position: "relative",
          flexDirection: "column",
        }}
      >
        <div className="no-surface">
          <h2>No GL Surface detected. Navigate to an example to inspect it.</h2>
          <ul>
            {listSurfaces().map((s) => (
              <li key={s.id}>
                <span onClick={() => mgr.setSurface(s)}>
                  {s.getGLName()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <InspectorContext.Provider value={mgr}>
      <div
        key={key}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        className="gl-inspector"
      >
        <header className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-sm">
          <select
            value={surface ? surface.id : ""}
            onChange={onSelectChange}
            className="bg-white text-gray-900 text-sm rounded px-2 py-1 border border-gray-300 outline-none"
          >
            <option value="">(none)</option>
            {listSurfaces().map((s) => (
              <option key={s.id} value={s.id}>
                {s.getGLName()}
              </option>
            ))}
          </select>
          <button
            onClick={onVisitorLoggerChange}
            className={`p-1.5 rounded transition-colors ${
              consoleLogsOn
                ? 'bg-gray-400/30 text-gray-900'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Toggle console logs"
          >
            <CommandLineIcon className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-0.5">
            {headerBody}
          </div>
        </header>
        {body}
      </div>
    </InspectorContext.Provider>
  );
}
