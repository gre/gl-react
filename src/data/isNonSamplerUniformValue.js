// heuristic to determine if a uniform value is not a texture kind
function isNonSamplerUniformValue (obj) {
  let typ = typeof obj;
  if (typ==="number" || typ==="boolean") return true;
  if (obj !== null && typ === "object" && obj instanceof Array) {
    typ = typeof obj[0];
    return typ==="number" || typ==="boolean";
  }
  return false;
}
module.exports = isNonSamplerUniformValue;
