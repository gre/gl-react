import { Dimensions } from "react-native";
import ImagesPicker from "../../toolbox/ImagesPicker";
import thumbnail from "../../images/thumbnails/mergechannels.jpg";
export { thumbnail };
export const title = "Merge color channels";
export const description = "showcase for Array of textures support.";

const imgPicker = {
  Editor: ImagesPicker,
  style: { width: Dimensions.get("window").width - 20 },
  imageStyle: { width: 40, height: 40 },
  images: [
    require("../../images/mergechannels-img1.png"),
    require("../../images/mergechannels-img2.png"),
    require("../../images/mergechannels-img3.png"),
    require("../../images/mergechannels-img4.png"),
    require("../../images/mergechannels-img5.png"),
    require("../../images/mergechannels-img6.png"),
    require("../../images/mergechannels-img7.png"),
    require("../../images/mergechannels-img8.png"),
  ],
};

export const toolbox = [
  {
    prop: "red",
    title: "red channel",
    ...imgPicker,
  },
  {
    prop: "green",
    title: "green channel",
    ...imgPicker,
  },
  {
    prop: "blue",
    title: "blue channel",
    ...imgPicker,
  },
];
