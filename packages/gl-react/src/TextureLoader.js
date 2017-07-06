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
   * try to get in sync the texture for a given input. otherwise null.
   */
  +get: (input: T) => ?WebGLTexture;

  /**
   * try to get in sync the texture size for a given input. otherwise null.
   */
  +getSize: (input: T) => ?[number, number];

  /**
   * load() called if get() was null. it returns a promise and a dispose function.
   * It is your responsability to cache the disposable per input.
   * If load() is called twice, same value should be returned. but you can drop it when it's loaded.
   */
  load(input: T): DisposablePromise<WebGLTexture> {
    // noop default implementation
    return {
      promise: new Promise(noop),
      dispose: noop
    };
  }
}
