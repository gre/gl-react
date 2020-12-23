//@flow
import type { VisitorLike } from "./Visitor";

let _globalVisitors: Array<VisitorLike> = (global.__glReactGlobalVisitor =
  global.__glReactGlobalVisitor || []);

/**
 * Utility to visit the Surface & Node draw lifecycle (used for logging and testing)
 * @namespace
 */
const Visitors = {
  /**
   * @memberof Visitors
   */
  add(visitor: VisitorLike) {
    _globalVisitors.push(visitor);
  },
  /**
   * @memberof Visitors
   */
  remove(visitor: VisitorLike) {
    const i = _globalVisitors.indexOf(visitor);
    if (i !== -1) _globalVisitors.splice(i, 1);
  },

  get() {
    return _globalVisitors;
  },
};

export default Visitors;
