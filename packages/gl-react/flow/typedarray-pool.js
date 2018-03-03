//@flow

declare module "typedarray-pool" {
  declare type DType =
    "uint8" |
    "uint16" |
    "uint32" |
    "int8" |
    "int16" |
    "int32" |
    "float" |
    "float32" |
    "double" |
    "float64" |
    "arraybuffer" |
    "data" |
    "uint8_clamped" |
    "buffer";
  declare module.exports: {
    malloc: (n: number, t?: DType) => $TypedArray,
    free: (array: $TypedArray) => void,
    mallocUint8: (n: number) => Uint8Array,
    mallocUint16: (n: number) => Uint16Array,
    mallocUint32: (n: number) => Uint32Array,
    mallocInt8: (n: number) => Int8Array,
    mallocInt16: (n: number) => Int16Array,
    mallocInt32: (n: number) => Int32Array,
    mallocFloat: (n: number) => Float32Array,
    mallocDouble: (n: number) => Float64Array,
    mallocArrayBuffer: (n: number) => ArrayBuffer,
    mallocDataView: (n: number) => DataView,
    mallocUint8Clamped: (n: number) => Uint8ClampedArray,
    mallocBuffer: (n: number) => Buffer,
    freeUint8: (array: Uint8Array) => void,
    freeUint16: (array: Uint16Array) => void,
    freeUint32: (array: Uint32Array) => void,
    freeInt8: (array: Int8Array) => void,
    freeInt16: (array: Int16Array) => void,
    freeInt32: (array: Int32Array) => void,
    freeFloat: (array: Float32Array) => void,
    freeDouble: (array: Float64Array) => void,
    freeArrayBuffer: (array: ArrayBuffer) => void,
    freeDataView: (array: DataView) => void,
    freeUint8Clamped: (array: Uint8ClampedArray) => void,
    freeBuffer: (array: Buffer) => void,
  };
}
