const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  layer: {
    frag: glslify(`${__dirname}/layer.frag`)
  }
});

class Layer extends GL.Component {
  render () {
    const { children, ...rest } = this.props;
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Layer");
    const [t1, t2] = children;
    return <GL.View
      {...rest}
      shader={shaders.layer}
      uniforms={{ t1, t2 }}
    />;
  }
}

module.exports = Layer;
