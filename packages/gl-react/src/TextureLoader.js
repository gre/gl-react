//@flow
import type { DisposablePromise } from "./helpers/disposable";

const noop = () => {};

/**
 * A texture loader is an extensible way to add more "renderable texture" into gl-react.
 */
export default class TextureLoader<T> {
  /**
   * @property {WebGLRenderingContext} gl - the contextual rendering context
   */
  gl: WebGLRenderingContext;

  /**
   *
   */
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /**
   * You must free everything you have done and stop all pending load() calls.
   */
  +dispose: () => void;

  /**
   * Check if the loader should handle a given input
   */
  +canLoad: (input: any) => boolean;

  /**
   * Load the resource by its input. it returns a promise and a dispose function.
   * If load() is called twice with the same input, same disposable object is expected (implementations needs to cache it).
   */
  load(input: T): DisposablePromise<WebGLTexture> {
    // noop default implementation
    return {
      promise: new Promise(noop),
      dispose: noop
    };
  }

  /**
   * try to get in sync the texture for a given input. otherwise null.
   * If null is returned, load() can be called in order to load the resource that will later be available in a future get().
   */
  +get: (input: T) => ?WebGLTexture;

  /**
   * try to get in sync the texture size for a given input. otherwise null.
   */
  +getSize: (input: T) => ?[number, number];
}
