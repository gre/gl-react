import markdown from "../../markdown";
import ImagesPicker from "../../toolbox/ImagesPicker";
export const title = "Merge color channels — sampler2D[] showcase";
export const desc = markdown`
This is a showcase for Array of textures support.
`;

const imgPicker = {
  Editor: ImagesPicker,
  style: { width: 380 },
  imageStyle: { maxWidth: 42, maxHeight: 42 },
  images: [
    require("./img1.png").default,
    require("./img2.png").default,
    require("./img3.png").default,
    require("./img4.png").default,
    require("./img5.png").default,
    require("./img6.png").default,
    require("./img7.png").default,
    require("./img8.png").default,
  ],
};

export const toolbox = [
  { prop: "red", title: "red channel", ...imgPicker },
  { prop: "green", title: "green channel", ...imgPicker },
  { prop: "blue", title: "blue channel", ...imgPicker },
];
