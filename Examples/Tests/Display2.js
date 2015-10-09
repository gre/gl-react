const React = require("react");
const GL = require("gl-react");
const glslify = require("glslify");

const shaders = GL.Shaders.create({
  display2: {
    frag: glslify(`${__dirname}/display2.frag`)
  }
});

module.exports = GL.createComponent(
  ({ width, height, children, vertical, ...rest }) => {
    if (!children || children.length !== 2) throw new Error("You must provide 2 children to Display2");
    let [t1, t2] = children;
    if (vertical) [t1,t2]=[t2,t1]; // just because webgl y's is reversed
    return <GL.View
      {...rest}
      shader={shaders.display2}
      width={width}
      height={height}
      uniforms={{ t1, t2, vertical }}
      debug={true}
    />;
  },
  {
    displayName: "Display2"
  }
);
