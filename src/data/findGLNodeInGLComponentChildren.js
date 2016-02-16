const unfoldGLComponent = require("./unfoldGLComponent");
const pluckObject = require("./pluckObject");

module.exports = function findGLNodeInGLComponentChildren (children, context) {
  // going down the VDOM tree, while we can unfold GLComponent
  const via = [];
  let accContext = context;
  for (let c = children;
    c && typeof c.type === "function";
    c = unfoldGLComponent(c, accContext, via)) {
    accContext = { ...accContext, ...pluckObject(c.props, ["width", "height", "pixelRatio"]) };
    if (c.type.isGLNode)
      return { childGLNode: c, via, context: accContext }; // found a GLNode
  }
};
