//@flow
import type Node from "./Node";
import type Bus from "./Bus";

/**
 * A set of Uniform symbols you can pass to a uniform. (recognized and interpreted by Node)
 */
const Uniform = {
  /**
   * Inject the texture of the previous framebuffer state
   */
  Backbuffer: "_Backbuffer_",

  /**
   * Inject the texture of the previous framebuffer state of another Node pointed by its reference.
   * @param  {Node | Bus} a Node or Bus instance of what you want the backbuffer from. the Node needs to have backbuffering enabled. (in case of Bus, it means its root Node)
   */
  backbufferFrom: (node: Node | Bus) => ({ type: "BackbufferFrom", node }),

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
  textureSizeRatio: (obj: *) => ({ type: "TextureSize", obj, ratio: true }),
};

export default Uniform;
