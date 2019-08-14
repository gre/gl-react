//@flow
import React from "react";
import { Visitor } from "gl-react";
import { globalRegistry, WebGLTextureLoader } from "webgltexture-loader";
import invariant from "invariant";
import type { Surface, Node } from "gl-react";
import type { Texture } from "gl-texture2d";
import renderer from "react-test-renderer";
import ndarray from "ndarray";
import defer from "promise-defer";
import drawNDArrayTexture from "webgltexture-loader-ndarray/lib/drawNDArrayTexture";

export const delay = (ms: number): Promise<void> =>
  new Promise(success => setTimeout(success, ms));

class FakeTexture {
  width: number;
  height: number;
  getPixels: () => any;
  constructor(props) {
    invariant(props.getPixels, "FakeTexture: getPixels is required");
    Object.assign(this, props);
  }
}

function createNodeMock(o) {
  switch (o.type) {
    case "faketexture":
      return new FakeTexture(o.props);
    case "canvas":
      return {
        width: o.props.width,
        height: o.props.height
      };
    default:
      return null;
  }
}

export const expectToBeCloseToColorArray = (
  actual: Uint8Array,
  expected: Uint8Array
) => {
  expect(actual).toBeInstanceOf(Uint8Array);
  expect(expected).toBeInstanceOf(Uint8Array);
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < actual.length; i += 4) {
    const dr = actual[i + 0] - expected[i + 0];
    const dg = actual[i + 1] - expected[i + 1];
    const db = actual[i + 2] - expected[i + 2];
    const da = actual[i + 3] - expected[i + 3];
    expect(dr * dr + dg * dg + db * db + da * da).toBeLessThan(10);
  }
};

export const create = (el: React.Element<*>) =>
  renderer.create(el, { createNodeMock });

type SurfaceCounters = {
  onSurfaceDrawEnd: number,
  onSurfaceDrawStart: number,
  onSurfaceDrawSkipped: number
};

type NodeCounters = {
  onNodeDrawSkipped: number,
  onNodeDrawStart: number,
  onNodeSyncDeps: number,
  onNodeDraw: number,
  onNodeDrawEnd: number
};

export class CountersVisitor extends Visitor {
  _counters = {
    onSurfaceDrawSkipped: 0,
    onSurfaceDrawStart: 0,
    onSurfaceDrawEnd: 0,
    onNodeDrawSkipped: 0,
    onNodeDrawStart: 0,
    onNodeSyncDeps: 0,
    onNodeDraw: 0,
    onNodeDrawEnd: 0
  };
  _surfaceCounters: WeakMap<Surface, SurfaceCounters> = new WeakMap();
  _nodeCounters: WeakMap<Node, NodeCounters> = new WeakMap();
  getCounters() {
    return this._counters;
  }
  getSurfaceCounters(surface: Surface): SurfaceCounters {
    let counters = this._surfaceCounters.get(surface);
    if (!counters) {
      counters = {
        onSurfaceDrawSkipped: 0,
        onSurfaceDrawStart: 0,
        onSurfaceDrawEnd: 0
      };
      this._surfaceCounters.set(surface, counters);
    }
    return counters;
  }
  getNodeCounters(node: Node): NodeCounters {
    let counters = this._nodeCounters.get(node);
    if (!counters) {
      counters = {
        onNodeDrawSkipped: 0,
        onNodeDrawStart: 0,
        onNodeSyncDeps: 0,
        onNodeDraw: 0,
        onNodeDrawEnd: 0
      };
      this._nodeCounters.set(node, counters);
    }
    return counters;
  }
  onSurfaceDrawSkipped(surface: Surface) {
    this._counters.onSurfaceDrawSkipped++;
    this.getSurfaceCounters(surface).onSurfaceDrawSkipped++;
  }
  onSurfaceDrawStart(surface: Surface) {
    this._counters.onSurfaceDrawStart++;
    this.getSurfaceCounters(surface).onSurfaceDrawStart++;
  }
  onSurfaceDrawEnd(surface: Surface) {
    this._counters.onSurfaceDrawEnd++;
    this.getSurfaceCounters(surface).onSurfaceDrawEnd++;
  }
  onNodeDrawSkipped(node: Node) {
    this._counters.onNodeDrawSkipped++;
    this.getNodeCounters(node).onNodeDrawSkipped++;
  }
  onNodeDrawStart(node: Node) {
    this._counters.onNodeDrawStart++;
    this.getNodeCounters(node).onNodeDrawStart++;
  }
  onNodeSyncDeps(node: Node) {
    this._counters.onNodeSyncDeps++;
    this.getNodeCounters(node).onNodeSyncDeps++;
  }
  onNodeDraw(node: Node) {
    this._counters.onNodeDraw++;
    this.getNodeCounters(node).onNodeDraw++;
  }
  onNodeDrawEnd(node: Node) {
    this._counters.onNodeDrawEnd++;
    this.getNodeCounters(node).onNodeDrawEnd++;
  }
}

export const red2x2 = ndarray(
  new Uint8Array([
    255,
    0,
    0,
    255,
    255,
    0,
    0,
    255,
    255,
    0,
    0,
    255,
    255,
    0,
    0,
    255
  ]),
  [2, 2, 4]
);

export const white3x3 = ndarray(
  new Uint8Array([
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255
  ]),
  [3, 3, 4]
);

export const yellow3x3 = ndarray(
  new Uint8Array([
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255
  ]),
  [3, 3, 4]
);
export const yellow3x2 = ndarray(
  new Uint8Array([
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255,
    255,
    255,
    0,
    255
  ]),
  [3, 2, 4]
);

export function createOneTextureLoader(
  makeTexture: (gl: any) => WebGLTexture,
  size: [number, number]
) {
  const textureId = Symbol("one-texture");
  const counters = {
    constructor: 0,
    dispose: 0,
    canLoad: 0,
    get: 0,
    load: 0,
    createTexture: 0
  };
  const d = defer();
  function resolve() {
    d.resolve();
    return delay(50); // FIXME this is a hack.
  }
  function reject(e: Error) {
    d.reject(e);
    return delay(50); // FIXME this is a hack.
  }
  class Loader extends WebGLTextureLoader<typeof textureId> {
    texture: ?Texture = null;
    constructor(gl: WebGLRenderingContext) {
      super(gl);
      ++counters.constructor;
    }
    dispose() {
      ++counters.dispose;
    }
    canLoad(input: any) {
      ++counters.canLoad;
      return input === textureId;
    }
    get() {
      ++counters.get;
      return (
        this.texture && {
          texture: this.texture,
          width: size[0],
          height: size[1]
        }
      );
    }
    load() {
      ++counters.load;
      const promise = d.promise.then(() => {
        ++counters.createTexture;
        this.texture = makeTexture(this.gl);
        return {
          texture: this.texture,
          width: size[0],
          height: size[1]
        };
      });
      return promise;
    }
  }
  return {
    Loader,
    textureId,
    counters,
    resolve,
    reject
  };
}

export function createNDArrayTexture(gl: WebGLRenderingContext, ndarray: *) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  drawNDArrayTexture(gl, texture, ndarray);
  return texture;
}
class FakeTextureLoader extends WebGLTextureLoader<FakeTexture> {
  textures: Array<WebGLTexture>;
  constructor(gl: WebGLRenderingContext) {
    super(gl);
    this.textures = [];
  }
  dispose() {
    const { gl } = this;
    this.textures.forEach(t => gl.deleteTexture(t));
  }
  canLoad(input: any) {
    return input instanceof FakeTexture;
  }
  get(ft: FakeTexture) {
    const array = ft.getPixels();
    if (array) {
      const t = createNDArrayTexture(this.gl, array);
      this.textures.push(t);
      return {
        texture: t,
        width: ft.width,
        height: ft.height
      };
    }
  }
  load(ft: FakeTexture) {
    const res = this.get(ft);
    return res ? Promise.resolve(res) : Promise.reject();
  }
}

globalRegistry.add(FakeTextureLoader);
