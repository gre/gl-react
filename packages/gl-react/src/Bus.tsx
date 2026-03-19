import invariant from "invariant";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Node from "./Node";
import invariantNoDependentsLoop from "./helpers/invariantNoDependentsLoop";
import genId from "./genId";

import type { Surface } from "./createSurface";
import type { NDArray } from "ndarray";
import GLContext from "./GLContext";

type Props = {
  children?: React.ReactElement | ((redraw?: () => void) => React.ReactElement);
  uniform?: string;
  index: number;
};

/**
 * a **Bus is a container to "cache" and re-use content** (tree of Node, canvas, video,...) somewhere else in your GL graph.
 */
export default class Bus extends Component<Props, any> {
  id: number = genId();
  static contextType = GLContext;

  context!: {
    glParent: any;
    glSurface: any;
    glSizable: any;
  };
  dependents: Array<Node | Surface> = [];

  static defaultProps = {
    index: 0,
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

  componentDidUpdate(prevProps: any) {
    const { uniform: oldUniform, index: oldIndex } = prevProps;
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

  glNode: Node | null = null;
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

  getGLRenderableNode(): Node | null {
    return this.glNode;
  }

  getGLRenderableContent(): any {
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
    const content: any = this.getGLRenderableContent();
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
    return this.glNode!.capture(x, y, w, h);
  }

  glBusRootNode: any = null;
  onRef = (ref: any) => {
    this.glBusRootNode = ref;
  };

  /**
   * Schedule a redraw of all nodes that depends on this Bus.
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
      <GLContext.Provider
        value={{
          glParent: this,
          glSurface: this.context.glSurface,
          glSizable: this.context.glSizable,
        }}
      >
        <RenderLessElement ref={mapRenderableContent ? this.onRef : undefined}>
          {typeof children === "function" ? children(this.redraw) : children}
        </RenderLessElement>
      </GLContext.Provider>
    );
  }
}
