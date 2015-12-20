const unfoldGLComponent = require("./unfoldGLComponent");

module.exports = function findGLNodeInGLComponentChildren (children, context) {
  // going down the VDOM tree, while we can unfold GLComponent
  const via = [];
  for (let c = children; c && typeof c.type === "function"; c = unfoldGLComponent(c, context, via)) {
    if (c.type.isGLNode)
      return { childGLNode: c, via }; // found a GLNode
  }
};
