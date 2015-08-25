const invariant = require("invariant");

module.exports = function (recordShader) {
  let _uid = 1;

  const Shaders = {
    create: function (obj) {
      invariant(typeof obj === "object", "config must be an object");
      const result = {};
      for (let key in obj) {
        const shader = obj[key];
        invariant(typeof shader === "object" && typeof shader.frag === "string",
        "invalid shader given to Shaders.create(). A valid shader is a { frag: String }");
        const id = _uid ++;
        if (!shader.name) shader.name = key;
        recordShader(id, shader);
        result[key] = id;
      }
      return result;
    },
    exists: function (id) {
      return typeof id === "number" && id >= 1 && id < _uid;
    }
  };

  return Shaders;
};
