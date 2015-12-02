const {EventEmitter} = require("events");
const invariant = require("invariant");

let _uid = 1;
const names = {};
const shaders = {};

const Shaders = {
  create (obj) {
    invariant(typeof obj === "object", "config must be an object");
    const result = {};
    for (let key in obj) {
      const shader = obj[key];
      invariant(typeof shader === "object" && typeof shader.frag === "string",
      "invalid shader given to Shaders.create(). A valid shader is a { frag: String }");
      const id = _uid ++;
      if (!shader.name) shader.name = key;
      names[id] = shader.name;
      shaders[id] = shader;
      this.emit("add", id, shader);
      result[key] = id;
    }
    return result;
  },
  remove (id) {
    invariant(id in shaders, "There is no such shader '%s'", id);
    delete shaders[id];
    delete names[id];
    this.emit("remove", id);
  },
  get (id) {
    return shaders[id];
  },
  getName (id) {
    return names[id];
  },
  list () {
    return Object.keys(shaders);
  },
  exists (id) {
    return typeof id === "number" && id >= 1 && id < _uid;
  },

  ...EventEmitter.prototype
};

EventEmitter.call(Shaders);

module.exports = Object.freeze(Shaders);
