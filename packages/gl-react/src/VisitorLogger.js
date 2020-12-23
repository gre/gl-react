//@flow
/* eslint-disable no-console */
import log from "./helpers/log";
import type { Surface } from "./createSurface";
import type Node from "./Node";
import type Bus from "./Bus";
import Visitor from "./Visitor";

const aggregateInfo = (info) =>
  Array.isArray(info)
    ? info.reduce((acc, info) => acc.concat(aggregateInfo(info)), [])
    : [
        String(
          (info.dependency && info.dependency.getGLName()) || info.initialObj
        ),
      ].concat(info.textureOptions ? [info.textureOptions] : []);

/**
 *
 */
export default class VisitorLogger extends Visitor {
  groupNestedLvl = 0;
  onSurfaceGLContextChange(surface: Surface, gl: ?WebGLRenderingContext) {
    if (gl) {
      log(surface.getGLName() + " _context acquired_");
    } else {
      log(surface.getGLName() + " _context lost_");
    }
  }
  onSurfaceDrawSkipped() {}
  onSurfaceDrawStart(surface: Surface) {
    const [width, height] = surface.getGLSize();
    console.groupCollapsed("Surface draw");
    this.groupNestedLvl = 1;
    log("_size_ `" + width + "`x`" + height + "`");
  }
  onSurfaceDrawError(e: Error) {
    console.error(e);
    while (this.groupNestedLvl > 0) {
      console.groupEnd();
      this.groupNestedLvl--;
    }
    return true;
  }
  onSurfaceDrawEnd() {
    this.groupNestedLvl--;
    console.groupEnd();
  }
  onNodeDrawSkipped(node: Node) {
    log(
      node.getGLName() +
        " redraw _skipped_: " +
        (!node.context.glSurface.gl
          ? "no gl context available!"
          : !node._needsRedraw
          ? "no need to redraw"
          : "")
    );
  }
  onNodeDrawStart(node: Node) {
    this.groupNestedLvl++;
    console.group(node.getGLName());
  }
  onNodeSyncDeps(
    node: Node,
    additions: Array<Bus | Node>,
    deletions: Array<Bus | Node>
  ) {
    if (additions.length)
      console.log(
        node.getGLName() +
          " +deps " +
          additions.map((n) => n.getGLName()).join(", ")
      );
    if (deletions.length)
      console.log(
        node.getGLName() +
          " -deps " +
          additions.map((n) => n.getGLName()).join(", ")
      );
  }
  onNodeDraw(node: Node, preparedUniforms: Array<*>) {
    const { blendFunc, clear } = node.props;
    this.groupNestedLvl++;
    console.group("DRAW " + node.getGLName());
    const [w, h] = node.getGLSize();
    log(
      "_size_ `" +
        w +
        "`x`" +
        h +
        "` " +
        "_clear_ `" +
        JSON.stringify(clear) +
        "` " +
        "_blendFunc_ `" +
        JSON.stringify(blendFunc) +
        "`"
    );
    log("_" + preparedUniforms.length + " uniforms:_");
    preparedUniforms.forEach((obj) => {
      let { key, type, value, getMetaInfo } = obj;
      type = String(type || "UNKNOWN");
      const values =
        value === undefined
          ? ""
          : Array.isArray(value)
          ? "[" + value.map((v) => "`" + String(v) + "`").join(",") + "]"
          : "`" + String(value) + "`";
      let spaces = "";
      for (let i = type.length + key.length - 18; i < 0; i++) {
        spaces += " ";
      }
      log(
        `${spaces}*${
          type === "UNKNOWN" ? "[c='color:red']UNKNOWN[c]" : type
        }* _${key}_ = ${values}`,
        ...(getMetaInfo ? aggregateInfo(getMetaInfo()) : [])
      );
    });
  }
  onNodeDrawEnd() {
    this.groupNestedLvl -= 2;
    console.groupEnd();
    console.groupEnd();
  }
}
