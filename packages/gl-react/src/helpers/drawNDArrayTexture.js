//@flow
import type { NDArray } from "ndarray";
import ndarray from "ndarray";
import ops from "ndarray-ops";
import pool from "typedarray-pool";

if (typeof Buffer === "undefined") {
  global.Buffer = class Buffer {
    // mock shim so pool don't crash..
    static isBuffer = b => b instanceof Buffer;
  };
}

// code is partly taken from https://github.com/stackgl/gl-texture2d/blob/master/texture.js

function isPacked(shape, stride) {
  if (shape.length === 3) {
    return (
      stride[2] === 1 &&
      stride[1] === shape[0] * shape[2] &&
      stride[0] === shape[2]
    );
  }
  return stride[0] === 1 && stride[1] === shape[0];
}

function convertFloatToUint8(out, inp) {
  ops.muls(out, inp, 255.0);
}

export default (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  array: NDArray
) => {
  let dtype = array.dtype;
  let shape = array.shape.slice();
  let maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (
    shape[0] < 0 ||
    shape[0] > maxSize ||
    shape[1] < 0 ||
    shape[1] > maxSize
  ) {
    throw new Error("gl-react: Invalid texture size");
  }
  let packed = isPacked(shape, array.stride.slice());
  let type = 0;
  if (dtype === "float32") {
    type = gl.FLOAT;
  } else if (dtype === "float64") {
    type = gl.FLOAT;
    packed = false;
    dtype = "float32";
  } else if (dtype === "uint8") {
    type = gl.UNSIGNED_BYTE;
  } else {
    type = gl.UNSIGNED_BYTE;
    packed = false;
    dtype = "uint8";
  }
  let format = 0;
  if (shape.length === 2) {
    format = gl.LUMINANCE;
    shape = [shape[0], shape[1], 1];
    array = ndarray(
      array.data,
      shape,
      [array.stride[0], array.stride[1], 1],
      array.offset
    );
  } else if (shape.length === 3) {
    if (shape[2] === 1) {
      format = gl.ALPHA;
    } else if (shape[2] === 2) {
      format = gl.LUMINANCE_ALPHA;
    } else if (shape[2] === 3) {
      format = gl.RGB;
    } else if (shape[2] === 4) {
      format = gl.RGBA;
    } else {
      throw new Error("gl-texture2d: Invalid shape for pixel coords");
    }
  } else {
    throw new Error("gl-texture2d: Invalid shape for texture");
  }
  if (type === gl.FLOAT && !gl.getExtension("OES_texture_float")) {
    type = gl.UNSIGNED_BYTE;
    packed = false;
  }
  let buffer, buf_store;
  let size = array.size;
  if (!packed) {
    let stride = [shape[2], shape[2] * shape[0], 1];
    buf_store = pool.malloc(size, dtype);
    let buf_array = ndarray(buf_store, shape, stride, 0);
    if (
      (dtype === "float32" || dtype === "float64") &&
      type === gl.UNSIGNED_BYTE
    ) {
      convertFloatToUint8(buf_array, array);
    } else {
      ops.assign(buf_array, array);
    }
    buffer = buf_store.subarray(0, size);
  } else if (array.offset === 0 && array.data.length === size) {
    buffer = array.data;
  } else {
    buffer = array.data.subarray(array.offset, array.offset + size);
  }
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    format,
    shape[0],
    shape[1],
    0,
    format,
    type,
    buffer
  );
  if (buf_store) {
    pool.free(buf_store);
  }
};
