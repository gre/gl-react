// Minimal browser shim for Node's `buffer` module.
// Only used by typedarray-pool (dep of gl-texture2d).
export const Buffer = {
  isBuffer() {
    return false;
  },
};
