const React = require("react");
const GL = require("gl-react-core");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  layer: {
    frag: glslify(`${__dirname}/layer.frag`)
  }
});

module.exports = GL.createComponent(
  ({ children, ...rest }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Layer");
    const [t1, t2] = children;
    return <GL.Node
      {...rest}
      shader={shaders.layer}
      uniforms={{ t1, t2 }}
    />;
  },
  {
    displayName: "Layer"
  }
);
