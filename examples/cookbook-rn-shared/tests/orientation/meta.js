import { Dimensions } from "react-native";
import ImagesPicker from "../../toolbox/ImagesPicker";

export const images = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
  uri: `https://raw.githubusercontent.com/recurser/exif-orientation-examples/master/Landscape_${i}.jpg`,
}));

export const title = "orientation";
export const description = "Test various image orientation";
export const toolbox = [
  {
    prop: "image",
    title: "image",
    Editor: ImagesPicker,
    style: { width: Dimensions.get("window").width - 20 },
    imageStyle: { width: 40, height: 30 },
    images,
  },
];
