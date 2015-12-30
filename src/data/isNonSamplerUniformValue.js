// heuristic to determine if a uniform value is not a texture kind
function isNonSamplerUniformValue (obj) {
  let typ = typeof obj;
  if (typ==="number" || typ==="boolean") return typ;
  if (obj !== null && typ === "object" && obj instanceof Array) {
    typ = typeof obj[0];
    return typ==="number" || typ==="boolean" ? typ+"[]" : null;
  }
  return null;
}
module.exports = isNonSamplerUniformValue;
