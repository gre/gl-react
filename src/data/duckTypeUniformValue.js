const React = require("react");
const isAnimated = require("../isAnimated");

// infer the uniform value type and validate it (throw error if invalid)

function duckTypeUniformValue (obj) {
  let typ = typeof obj;

  if (typ==="number") {
    if(isNaN(obj) || !isFinite(obj)) throw new Error("invalid number: '"+obj+"'");
    return typ;
  }

  if (typ==="boolean") {
    return typ;
  }

  if (typ==="string") {
    return typ;
  }

  if (typ==="undefined") {
    return null;
  }

  if (typ === "object") {

    if (!obj) {
      return null;
    }

    if (typeof obj.uri === "string") {
      return "{uri}";
    }

    if (obj.data && obj.shape && obj.stride) {
      return "ndarray";
    }

    if (obj instanceof Array) {
      const length = obj.length;
      if (!length) throw new Error("array is empty");
      let foundAnimated = false;
      let foundVDOM = false;
      let foundNumber = false;
      let foundBoolean = false;
      for (let i=0; i<length; i++) {
        const val = obj[i];
        const t = typeof val;
        switch (t) {
        case "object":
          if (val && isAnimated(val))
            foundAnimated = true;
          else if (val && React.isValidElement(val))
            foundVDOM = true;
          else if (val instanceof Array)
            return duckTypeUniformValue(val);
          else
            throw new Error("at index "+i+", Unrecognized object: '"+val+"'");
          break;

        case "number":
          if(isNaN(val) || !isFinite(val))
            throw new Error("at index "+i+", invalid number: '"+val+"'");
          foundNumber = true;
          break;

        case "boolean":
          foundBoolean = true;
          break;

        default:
          throw new Error("at index "+i+", Unrecognized object: "+val);
        }
      }

      const foundNumberOrBooleanOrAnimated = foundNumber || foundBoolean || foundAnimated;
      if (foundNumberOrBooleanOrAnimated && foundVDOM) {
        throw new Error("Invalid array. Found both VDOM value and numbers/booleans/animated");
      }

      if (foundVDOM) {
        return "vdom[]";
      }
      if (foundAnimated) {
        return "animated[]";
      }
      if (foundNumber) {
        return "number[]";
      }
      if (foundBoolean) {
        return "boolean[]";
      }
    }

    if (isAnimated(obj)) {
      return "animated";
    }

    if (React.isValidElement(obj)) {
      return "vdom";
    }
  }

  throw new Error("Unrecognized object: "+obj);
}

module.exports = duckTypeUniformValue;
