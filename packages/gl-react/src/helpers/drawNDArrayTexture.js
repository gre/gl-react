//@flow
import type {NDArray} from "ndarray";
import ndarray from "ndarray";
import ops from "ndarray-ops";
import pool from "typedarray-pool";

// code is partly taken from https://github.com/stackgl/gl-texture2d/blob/master/texture.js

function isPacked(shape, stride) {
  if(shape.length === 3) {
    return  (stride[2] === 1) &&
            (stride[1] === shape[0]*shape[2]) &&
            (stride[0] === shape[2]);
  }
  return  (stride[0] === 1) &&
          (stride[1] === shape[0]);
}

function convertFloatToUint8 (out, inp) {
  ops.muls(out, inp, 255.0);
}

export default (gl: WebGLRenderingContext, texture: WebGLTexture, array: NDArray) => {
  /*
  const cformat = gl.RGBA, ctype = gl.UNSIGNED_BYTE;

  let dtype = array.dtype;
  let shape = array.shape.slice();
  if(shape.length < 2 || shape.length > 3) {
    throw new Error("gl-react: Invalid ndarray, must be 2d or 3d");
  }
  let type = 0, format = 0;
  let packed = isPacked(shape, array.stride.slice());
  if(dtype === "float32") {
    type = gl.FLOAT;
  } else if(dtype === "float64") {
    type = gl.FLOAT;
    packed = false;
    dtype = "float32";
  } else if(dtype === "uint8") {
    type = gl.UNSIGNED_BYTE;
  } else {
    type = gl.UNSIGNED_BYTE;
    packed = false;
    dtype = "uint8";
  }
  if(shape.length === 2) {
    format = gl.LUMINANCE;
    shape = [shape[0], shape[1], 1];
    array = ndarray(array.data, shape, [array.stride[0], array.stride[1], 1], array.offset);
  } else if(shape.length === 3) {
    if(shape[2] === 1) {
      format = gl.ALPHA;
    } else if(shape[2] === 2) {
      format = gl.LUMINANCE_ALPHA;
    } else if(shape[2] === 3) {
      format = gl.RGB;
    } else if(shape[2] === 4) {
      format = gl.RGBA;
    } else {
      throw new Error("gl-react: Invalid shape for pixel coords");
    }
  } else {
    throw new Error("gl-react: Invalid shape for texture");
  }
  //For 1-channel textures allow conversion between formats
  if((format  === gl.LUMINANCE || format  === gl.ALPHA) &&
     (cformat === gl.LUMINANCE || cformat === gl.ALPHA)) {
    format = cformat;
  }
  if(format !== cformat) {
    throw new Error("gl-react: Incompatible texture format for setPixels");
  }
  let size = array.size;
  if(type === ctype && packed) {
    //Array data types are compatible, can directly copy into texture
    if(array.offset === 0 && array.data.length === size) {
      console.log("no offset & exact size")
      gl.texImage2D(gl.TEXTURE_2D, 0, cformat, shape[0], shape[1], 0, cformat, ctype, array.data);
    }
    else {
      console.log("fix offset")
      gl.texImage2D(gl.TEXTURE_2D, 0, cformat, shape[0], shape[1], 0, cformat, ctype, array.data.subarray(array.offset, array.offset+size));
    }
  } else {
    //Need to do type conversion to pack data into buffer
    let pack_buffer;
    if(ctype === gl.FLOAT) {
      pack_buffer = pool.mallocFloat32(size);
    } else {
      pack_buffer = pool.mallocUint8(size);
    }
    let pack_view = ndarray(pack_buffer, shape, [shape[2], shape[2]*shape[0], 1]);
    if(type === gl.FLOAT && ctype === gl.UNSIGNED_BYTE) {
      convertFloatToUint8(pack_view, array);
    } else {
      ops.assign(pack_view, array);
    }
    console.log("else case")
    gl.texImage2D(gl.TEXTURE_2D, 0, cformat, shape[0], shape[1], 0, cformat, ctype, pack_buffer.subarray(0, size));
    if(ctype === gl.FLOAT) {
      pool.freeFloat32(pack_buffer);
    } else {
      pool.freeUint8(pack_buffer);
    }
  }
  */

  var dtype = array.dtype;
  var shape = array.shape.slice();
  var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if(shape[0] < 0 || shape[0] > maxSize || shape[1] < 0 || shape[1] > maxSize) {
    throw new Error("gl-react: Invalid texture size");
  }
  var packed = isPacked(shape, array.stride.slice());
  var type = 0;
  if(dtype === "float32") {
    type = gl.FLOAT;
  } else if(dtype === "float64") {
    type = gl.FLOAT;
    packed = false;
    dtype = "float32";
  } else if(dtype === "uint8") {
    type = gl.UNSIGNED_BYTE;
  } else {
    type = gl.UNSIGNED_BYTE;
    packed = false;
    dtype = "uint8";
  }
  var format = 0;
  if(shape.length === 2) {
    format = gl.LUMINANCE;
    shape = [shape[0], shape[1], 1];
    array = ndarray(array.data, shape, [array.stride[0], array.stride[1], 1], array.offset);
  } else if(shape.length === 3) {
    if(shape[2] === 1) {
      format = gl.ALPHA;
    } else if(shape[2] === 2) {
      format = gl.LUMINANCE_ALPHA;
    } else if(shape[2] === 3) {
      format = gl.RGB;
    } else if(shape[2] === 4) {
      format = gl.RGBA;
    } else {
      throw new Error("gl-texture2d: Invalid shape for pixel coords");
    }
  } else {
    throw new Error("gl-texture2d: Invalid shape for texture");
  }
  if(type === gl.FLOAT && !gl.getExtension("OES_texture_float")) {
    type = gl.UNSIGNED_BYTE;
    packed = false;
  }
  var buffer, buf_store;
  var size = array.size;
  if(!packed) {
    var stride = [shape[2], shape[2]*shape[0], 1];
    buf_store = pool.malloc(size, dtype);
    var buf_array = ndarray(buf_store, shape, stride, 0);
    if((dtype === "float32" || dtype === "float64") && type === gl.UNSIGNED_BYTE) {
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
  console.log("texture", texture, shape, format, type)
  gl.texImage2D(gl.TEXTURE_2D, 0, format, shape[0], shape[1], 0, format, type, buffer);
  if(!packed) {
    pool.free(buf_store);
  }
};
