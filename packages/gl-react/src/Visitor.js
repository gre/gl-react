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
  onSurfaceMount(surface: Surface) {}
  /**
   *
   */
  onSurfaceUnmount(surface: Surface) {}
  /**
   *
   */
  onSurfaceGLContextChange(surface: Surface, gl: ?WebGLRenderingContext) {}
  /**
   */
  onSurfaceDrawSkipped(surface: Surface) {}
  /**
   */
  onSurfaceDrawStart(surface: Surface) {}
  /**
   * if returns true, it prevent a throw to happen from the request animation frame loop (or from a surface.flush() call).
   */
  onSurfaceDrawError(e: Error) {
    return false;
  }
  /**
   */
  onSurfaceDrawEnd(surface: Surface) {}
  /**
   */
  onNodeDrawSkipped(node: Node) {}
  /**
   */
  onNodeDrawStart(node: Node) {}
  /**
   */
  onNodeSyncDeps(
    node: Node,
    additions: Array<Node | Bus>,
    deletions: Array<Node | Bus>
  ) {}
  /**
   */
  onNodeDraw(node: Node, preparedUniforms: Array<*>) {}
  /**
   */
  onNodeDrawEnd(node: Node) {}
}
