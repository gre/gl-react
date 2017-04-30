//@flow
import invariant from "invariant";
import Node from "../Node";
import type { Surface } from "../createSurface";
import type Bus from "../Bus";

// check that base does not exist in node dependents graph
export default function invariantNoDependentsLoop(
  base: Bus | Node,
  node: Node | Surface
): void {
  invariant(
    base !== node,
    "gl-react: Found a loop in the rendering graph.\n" +
      "If you want to get back previous state, please use `backbuffering` instead"
  );
  if (node instanceof Node) {
    for (let i = 0; i < node.dependents.length; i++) {
      invariantNoDependentsLoop(base, node.dependents[i]);
    }
  }
}
