import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "IBEX (js13k 2014 – greweb)";

export const toolbox = [
  {
    prop: "speed",
    title: (value) => "Simulation Speed (" + value + " FPS)",
    Editor: makeFloatSlider(1, 60, 1),
  },
  {
    prop: "forestGrowFactor",
    title: "Forest Grow Factor",
    Editor: makeFloatSlider(0, 50, 1),
  },
  {
    prop: "waterFactor",
    title: "Water Factor",
    Editor: makeFloatSlider(0, 1, 0.01),
  },
  {
    prop: "fireFactor",
    title: "Volcano Factor",
    Editor: makeFloatSlider(0, 1, 0.01),
  },
];
