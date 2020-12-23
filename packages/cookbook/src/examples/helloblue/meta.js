import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Hello GL blue";

export const desc = ``;

export const descAfter = `^ Examples can have properties.
They are injected as React props.`;

export const toolbox = [
  { prop: "blue", title: "Blue Color", Editor: makeFloatSlider(0, 1, 0.01) },
];
