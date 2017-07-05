//@flow

/**
 * A set of Uniform symbols you can pass to a uniform. (recognized and interpreted by Node)
 */
const Uniform = {
  /**
   * Inject the texture of the previous framebuffer state
   */
  Backbuffer: "_Backbuffer_",
  /**
   * the framebuffer size itself
   */
  Resolution: "_Resolution_",
  /**
   * Inject the size of a given Texture input
   * @param {any} obj the texture input object
   */
  textureSize: (obj: *) => ({ type: "TextureSize", obj }),
  /**
   * Inject the width/height ratio of a given Texture input
   * @param {any} obj the texture input object
   */
  textureSizeRatio: (obj: *) => ({ type: "TextureSize", obj, ratio: true })
};

export default Uniform;
