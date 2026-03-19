declare module "ndarray" {
  interface NDArray {
    shape: number[];
    data: ArrayLike<number>;
    stride: number[];
    offset: number;
    size: number;
    order: number[];
    dimension: number;
    transpose(...args: number[]): NDArray;
    step(...args: number[]): NDArray;
    lo(...args: number[]): NDArray;
    hi(...args: number[]): NDArray;
    pick(...args: number[]): NDArray;
  }

  function ndarray(
    arr: ArrayLike<number> | ArrayBufferView,
    shape?: number[],
    stride?: number[],
    offset?: number
  ): NDArray;

  export type { NDArray };
  export default ndarray;
}
