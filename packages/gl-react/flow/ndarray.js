//@flow

/**
 * Multidimensional Arrays object from library
 * [ndarray](https://www.npmjs.com/package/ndarray)
 */
type NDArray = {
  shape: Array<number>,
  data: $TypedArray | Array<number>,
  stride: Array<number>,
  transpose: (...args: Array<number>) => NDArray,
  step: (...args: Array<number>) => NDArray,
};

declare module "ndarray" {
  declare type NDArray = NDArray;
  declare var exports:
    (arr: $TypedArray | Array<number>, shape: Array<number>) => NDArray;
}
