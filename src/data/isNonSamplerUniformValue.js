const isAnimated = require("../isAnimated");

// heuristic to determine if a uniform value is not a texture kind
// TODO: we should generalize this into a single "getUniformValueType" function
function isNonSamplerUniformValue (obj) {
  let typ = typeof obj;
  if (typ==="number" || typ==="boolean") return typ;
  if (obj !== null && typ === "object" && obj instanceof Array) {
    typ = typeof obj[0];
    return typ==="number" || typ==="boolean" ? typ+"[]" : (isAnimated(obj[0]) ? "number[]" : null);
  }
  return null;
}
module.exports = isNonSamplerUniformValue;
