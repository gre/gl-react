const pickReactFirstChild = require("./pickReactFirstChild");

module.exports = function unfoldGLComponent (c, context, glComponentNameArray) {
  const Class = c.type;
  if (!(Class.isGLComponent)) return;
  const instance = new Class(); // FIXME: React might eventually improve to ease the work done here. see https://github.com/facebook/react/issues/4697#issuecomment-134335822
  instance.props = c.props;
  instance.context = context;
  const child = pickReactFirstChild(instance.render());
  const glComponentName = Class.displayName || Class.name || "";
  glComponentNameArray.push(glComponentName);
  return child;
};
