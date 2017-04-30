//@flow
// Some utility for the disposable pattern

/**
 * @private
 * An object that have a dispose() function
 */
export type Disposable = {
  +dispose: () => void,
};

/**
 * An object with a `promise` and a `dispose` function to cancel the promise (making a pending promise to never ends).
 */
type DisposablePromise<A> = {|
  +dispose: () => void,
  promise: Promise<A>,
|};
export type { DisposablePromise };

/**
 * @private
 * destroy an object of disposable.
 * NB the object gets emptied as a way to help the GC.
 */
export function disposeObjectMap<T: Disposable>(objmap: { [key: string]: T }) {
  for (const k in objmap) {
    if (objmap.hasOwnProperty(k)) {
      objmap[k].dispose();
      delete objmap[k];
    }
  }
}

/**
 * @private
 * destroy a array of disposable.
 * NB the array gets emptied as a way to help the GC.
 */
export function disposeArray<T: Disposable>(arr: Array<T>) {
  let d;
  while ((d = arr.pop()))
    d.dispose();
}
