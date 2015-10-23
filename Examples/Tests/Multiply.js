const React = require("react");
const GL = require("gl-react-core");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  multiply: {
    frag: glslify(`${__dirname}/multiply.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, children }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Multiply");
    const [t1, t2] = children;
    return <GL.Node
      shader={shaders.multiply}
      width={width}
      height={height}
      uniforms={{ t1, t2 }}
    />;
  },
  { displayName: "Multiply" });
