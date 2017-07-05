//@flow

/**
 * Multidimensional Arrays object from library
 * [ndarray](https://www.npmjs.com/package/ndarray)
 */
type NDArray = {
  shape: Array<number>,
  data: $TypedArray | Array<number>,
  stride: Array<number>,
  offset: number,
  size: Array<number>,
  order: Array<number>,
  dimension: number,
  transpose: (...args: Array<number>) => NDArray,
  step: (...args: Array<number>) => NDArray,
  lo: (...args: Array<number>) => NDArray,
  hi: (...args: Array<number>) => NDArray,
  pick: (...args: Array<number>) => *
};

declare module "ndarray" {
  declare type NDArray = NDArray;
  declare var exports: (
    arr: $TypedArray | Array<number>,
    shape?: Array<number>,
    stride?: Array<number>,
    offset?: number
  ) => NDArray;
}
