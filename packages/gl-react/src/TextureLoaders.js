//@flow
import type TextureLoader from "./TextureLoader";
import TextureLoaderNDArray from "./TextureLoaderNDArray";

const loaderClasses: Array<Class<TextureLoader<any>>> = [TextureLoaderNDArray];

/**
 * Extensible way to support more sampler2D uniform texture formats.
 * You must call the methods statically before the `<Surface>` is instanciated.
 * @namespace
 */
const TextureLoaders = {
  /**
   * Add a TextureLoader class to extend texture format support.
   * @memberof TextureLoaders
   */
  add(loader: Class<TextureLoader<any>>) {
    loaderClasses.push(loader);
  },
  /**
   * Remove a previously added TextureLoader class.
   * @memberof TextureLoaders
   */
  remove(loader: Class<TextureLoader<any>>) {
    const i = loaderClasses.indexOf(loader);
    if (i !== -1) loaderClasses.splice(i, 1);
  },
  get() {
    return loaderClasses;
  }
};

export default TextureLoaders;
