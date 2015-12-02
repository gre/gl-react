
function Content (id) {
  return { type: "content", id };
}

function NDArray (ndarray) {
  return { type: "ndarray", ndarray };
}

function URI (obj) {
  return { type: "uri", ...obj };
}

function Framebuffer (id) {
  return { type: "fbo", id };
}

function withOpts (obj, opts) {
  return { ...obj, opts };
}

module.exports = {
  Content,
  NDArray,
  URI,
  Framebuffer,
  withOpts
};
