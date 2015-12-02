const unfoldGLComponent = require("./unfoldGLComponent");

module.exports = function findGLNodeInGLComponentChildren (children) {
  // going down the VDOM tree, while we can unfold GLComponent
  const via = [];
  for (let c = children; c && typeof c.type === "function"; c = unfoldGLComponent(c, via)) {
    if (c.type.isGLNode)
      return { childGLNode: c, via }; // found a GLNode
  }
};
