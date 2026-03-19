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
   */
  backbufferFrom: (node: Node | Bus) => ({
    type: "BackbufferFrom" as const,
    node,
  }),

  /**
   * the framebuffer size itself
   */
  Resolution: "_Resolution_",
  /**
   * Inject the size of a given Texture input
   */
  textureSize: (obj: any) => ({ type: "TextureSize" as const, obj }),
  /**
   * Inject the width/height ratio of a given Texture input
   */
  textureSizeRatio: (obj: any) => ({
    type: "TextureSize" as const,
    obj,
    ratio: true as const,
  }),
};

export default Uniform;
