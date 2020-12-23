//@flow
import invariant from "invariant";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Node from "./Node";
import invariantNoDependentsLoop from "./helpers/invariantNoDependentsLoop";
import genId from "./genId";

import type { Surface } from "./createSurface";
import type { NDArray } from "ndarray";

type Props = {|
  children?: React$Element<*> | ((redraw?: () => void) => React$Element<*>),
  uniform?: string,
  index: number,
|};

/**
 * a **Bus is a container to "cache" and re-use content** (tree of Node, canvas, video,...) somewhere else in your GL graph.
 * To use it, use the Bus `ref`:
 * - provide it in another Node texture uniform so you can share computation (send a Node texture to multiple Nodes dependent) (more exactly, a working pattern is to give a `()=>ref` function that will be resolved in `DidUpdate` lifecycle)
 * - You have a `capture()` method to snapshot the underlying Node (because Node can be hidden being nested React components).
 *
 *
 * @prop {any} children the content to render. It can also be a function that takes a redraw function and render an element.
 * @prop {string} [uniform] In case you want to explicitely draw Bus directly into a uniform, you can give the uniform name of the parent node.
 * If this prop is not used, the Bus does not directly belong to a Node and a ref can be used to indirectly give a texture to a node.
 * `uniform` is equivalent to directly pass your VDOM inside the Node uniforms prop.
 *
 * **Usage Example**
 *
 * [![](https://github.com/ProjectSeptemberInc/gl-react/raw/master/docs/examples/blur.gif)](/blurmapmouse)
 *
 * @example
 *
 * <Surface ...>
 *   <Bus ref="myBus">
 *     //here, glEffects or content like a canvas/video...
 *   </Bus>
 *   <Node uniforms={{
 *     texture: () => this.refs.myBus
 *   }} ... />
 * </Surface>
 *
 */
export default class Bus extends Component<Props, *> {
  id: number = genId();
  context: {
    glParent: Surface | Node,
    glSurface: Surface,
  };
  dependents: Array<Node | Surface> = [];

  static defaultProps = {
    index: 0,
  };

  static contextTypes = {
    glParent: PropTypes.object.isRequired,
    glSurface: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    glParent: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { uniform, index } = this.props;
    if (uniform) {
      const { glParent } = this.context;
      invariant(
        glParent instanceof Node,
        'a <Bus uniform=".." /> needs to be inside a Node'
      );
      glParent._addUniformBus(this, uniform, index);
    }
    this.redraw();
  }

  componentWillUnmount() {
    const { uniform, index } = this.props;
    if (uniform) {
      const { glParent } = this.context;
      invariant(
        glParent instanceof Node,
        'a <Bus uniform=".." /> needs to be inside a Node'
      );
      glParent._removeUniformBus(this, uniform, index);
    }
  }

  componentDidUpdate({ uniform: oldUniform, index: oldIndex }: *) {
    const { uniform, index } = this.props;
    if (uniform && (uniform !== oldUniform || index !== oldIndex)) {
      const { glParent } = this.context;
      invariant(
        glParent instanceof Node,
        'a <Bus uniform=".." /> needs to be inside a Node'
      );
      if (oldUniform) glParent._removeUniformBus(this, oldUniform, oldIndex);
      glParent._addUniformBus(this, uniform, index);
    }
    this.redraw();
  }

  getChildContext(): { glParent: Bus } {
    return {
      glParent: this,
    };
  }

  glNode: ?Node = null;
  _addGLNodeChild(node: Node) {
    this.glNode = node;
    this.context.glParent.redraw();
  }
  _removeGLNodeChild(node: Node) {
    this.glNode = null;
  }

  _addDependent(node: Node | Surface) {
    const i = this.dependents.indexOf(node);
    if (i === -1) {
      invariantNoDependentsLoop(this, node);
      this.dependents.push(node);
    }
  }

  _removeDependent(node: Node | Surface) {
    const i = this.dependents.indexOf(node);
    if (i !== -1) this.dependents.splice(i, 1);
  }

  getGLRenderableNode(): ?Node {
    return this.glNode;
  }

  getGLRenderableContent(): mixed {
    const { mapRenderableContent } = this.context.glSurface;
    const { glBusRootNode } = this;
    return glBusRootNode && mapRenderableContent
      ? mapRenderableContent(glBusRootNode)
      : null;
  }

  getGLName(): string {
    return `Bus(${
      this.glNode
        ? this.glNode.getGLName()
        : String(this.getGLRenderableContent())
    })`;
  }

  getGLShortName(): string {
    const content = this.getGLRenderableContent();
    const shortContentName = String(
      (content && content.constructor && content.constructor.name) || content
    );
    return `Bus(${
      this.glNode ? this.glNode.getGLShortName() : shortContentName
    })`;
  }

  /**
   * Capture the underlying Node pixels.
   * NB it only works for nodes, not for content like video/canvas.
   */
  capture(x?: number, y?: number, w?: number, h?: number): NDArray {
    invariant(this.glNode, "Bus does not contain any Node");
    return this.glNode.capture(x, y, w, h);
  }

  glBusRootNode: ?mixed;
  onRef = (ref: mixed) => {
    this.glBusRootNode = ref;
  };

  /**
   * Schedule a redraw of all nodes that depends on this Bus.
   *
   * @function
   */
  redraw = () => {
    this.dependents.forEach((d) => d.redraw());
  };

  _onContextLost() {
    const { glNode } = this;
    if (glNode) glNode._onContextLost();
  }

  _onContextRestored(gl: WebGLRenderingContext) {
    const { glNode } = this;
    if (glNode) glNode._onContextRestored(gl);
  }

  _draw = () => {
    // FIXME: _draw() on a Bus? (would a third party need this?)
  };

  render() {
    const { children } = this.props;
    const {
      glSurface: { RenderLessElement, mapRenderableContent },
    } = this.context;
    return (
      <RenderLessElement ref={mapRenderableContent ? this.onRef : undefined}>
        {typeof children === "function" ? children(this.redraw) : children}
      </RenderLessElement>
    );
  }
}
