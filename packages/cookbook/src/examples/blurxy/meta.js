import markdown from "../../markdown";
import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "simple Blur (2-passes)";

export const desc = markdown`
Implementing Blur efficiently isn't trivial.
This approach do 2 passes _(X and Y)_
`;
export const descAfter = markdown`
We apply a linear blur (9 gaussian lookup)
on Y axis and then do the same on X axis.

We can see the blur quality isn't perfect,
[next example](/blurxydownscale) will improve that.
`;

export const toolbox = [
  { prop: "factor", title: "Blur", Editor: makeFloatSlider(0, 8, 0.2) },
];
