//@flow
import React from "react";
import connectSize from "./connectSize";
import Bus from "./Bus";
import LinearCopy from "./LinearCopy";

function warn(method, alternative) {
  console.warn("gl-react: " + method + " is deprecated. " + alternative);
}

export function createComponent(
  renderGLNode: () => React.Element<*>,
  staticFields?: Object
) {
  warn(
    "createComponent(" + String(renderGLNode) + ")",
    "You can now just use a normal React Component (or a stateless component function). \n" +
      "If you need the contextual {width,height} props, use connectSize() decorator."
  );
  const C = connectSize(renderGLNode);
  Object.assign(C, staticFields);
  return C;
}

type UniformProps = {
  children?: React.Element<*>,
  name: string
};
export class Uniform extends React.Component {
  props: UniformProps;
  constructor({ name }: UniformProps) {
    super();
    warn(
      "GL.Uniform",
      `Please directly use <Node uniforms={{ ${name}: value }}>
You might also need to use <Bus> if you want to reuse content.`
    );
  }
  render() {
    let { children } = this.props;
    if (!React.isValidElement(this.props.children)) {
      children = ( // LinearCopy to the rescue!
        <LinearCopy>
          {children}
        </LinearCopy>
      );
    }
    return (
      <Bus uniform={this.props.name}>
        {children}
      </Bus>
    );
  }
}
