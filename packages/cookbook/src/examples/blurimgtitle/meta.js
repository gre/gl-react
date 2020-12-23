import ImagesPicker from "../../toolbox/ImagesPicker";
import makeTextArea from "../../toolbox/makeTextArea";
import makeFloatSlider from "../../toolbox/makeFloatSlider";

export const title = "Dynamic Blur Image Title";

export const toolbox = [
  {
    prop: "title",
    title: "Title",
    Editor: makeTextArea({
      height: 140,
      padding: 6,
      fontFamily: "Didot,Georgia,serif",
      fontSize: "36px",
      lineHeight: "42px",
      fontWeight: "bold",
      textAlign: "center",
    }),
  },
  {
    prop: "colorThreshold",
    title: "Color Threshold",
    Editor: makeFloatSlider(0, 1, 0.01),
  }, // FIXME black <-> white
  {
    prop: "image",
    title: "Image",
    Editor: ImagesPicker,
    style: { width: 400 },
    imageStyle: { maxWidth: 56, maxHeight: 56, marginBottom: 16 },
    images: [
      require("./sf-1.jpg").default,
      require("./sf-2.jpg").default,
      require("./sf-3.jpg").default,
      require("./sf-4.jpg").default,
      require("./sf-5.jpg").default,
      require("./sf-6.jpg").default,
      require("./sf-7.jpg").default,
    ],
  },
];
