//@flow
import type { Surface } from "./createSurface";
import type Node from "./Node";
import type Bus from "./Bus";

export type VisitorLike = {
  +onSurfaceMount: (surface: Surface) => void,
  +onSurfaceUnmount: (surface: Surface) => void,
  +onSurfaceGLContextChange: (
    surface: Surface,
    gl: ?WebGLRenderingContext
  ) => void,
  +onSurfaceDrawSkipped: (surface: Surface) => void,
  +onSurfaceDrawStart: (surface: Surface) => void,
  +onSurfaceDrawError: (e: Error) => any,
  +onSurfaceDrawEnd: (surface: Surface) => void,
  +onNodeDrawSkipped: (node: Node) => void,
  +onNodeDrawStart: (node: Node) => void,
  +onNodeSyncDeps: (
    node: Node,
    additions: Array<Node | Bus>,
    deletions: Array<Node | Bus>
  ) => void,
  +onNodeDraw: (node: Node, preparedUniforms: Array<*>) => void,
  +onNodeDrawEnd: (node: Node) => void,
};

/**
 *
 */
export default class Visitor {
  /**
   *
   */
  onSurfaceMount(surface: Surface) {} // eslint-disable-line no-unused-vars
  /**
   *
   */
  onSurfaceUnmount(surface: Surface) {} // eslint-disable-line no-unused-vars
  /**
   *
   */
  onSurfaceGLContextChange(surface: Surface, gl: ?WebGLRenderingContext) {} // eslint-disable-line no-unused-vars
  /**
   */
  onSurfaceDrawSkipped(surface: Surface) {} // eslint-disable-line no-unused-vars
  /**
   */
  onSurfaceDrawStart(surface: Surface) {} // eslint-disable-line no-unused-vars
  /**
   * if returns true, it prevent a throw to happen from the request animation frame loop (or from a surface.flush() call).
   */
  onSurfaceDrawError(e: Error) {
    return false;
  } // eslint-disable-line no-unused-vars
  /**
   */
  onSurfaceDrawEnd(surface: Surface) {} // eslint-disable-line no-unused-vars
  /**
   */
  onNodeDrawSkipped(node: Node) {} // eslint-disable-line no-unused-vars
  /**
   */
  onNodeDrawStart(node: Node) {} // eslint-disable-line no-unused-vars
  /**
   */
  onNodeSyncDeps(
    node: Node,
    additions: Array<Node | Bus>,
    deletions: Array<Node | Bus>
  ) {} // eslint-disable-line no-unused-vars
  /**
   */
  onNodeDraw(node: Node, preparedUniforms: Array<*>) {} // eslint-disable-line no-unused-vars
  /**
   */
  onNodeDrawEnd(node: Node) {} // eslint-disable-line no-unused-vars
}
