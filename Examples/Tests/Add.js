const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  add: {
    frag: glslify(`${__dirname}/add.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, children }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Add");
    const [t1, t2] = children;
    return <GL.View
      shader={shaders.add}
      width={width}
      height={height}
      uniforms={{ t1, t2 }}
    />;
  }, { displayName: "Add" });
