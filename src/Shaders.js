const {EventEmitter} = require("events");
const invariant = require("invariant");
const defer = require("promise-defer");

const INLINE_NAME = "<inline>";

let _uid = 1;
const names = {}; // keep names
const shaders = {}; // keep shader objects
const shadersCompileResponses = {}; // keep promise of compile responses
const shadersReferenceCounters = {}; // reference count the shaders created with Shaders.create()/used inline so we don't delete them if one of 2 dups is still used

const surfaceInlines = {};
const previousSurfaceInlines = {};

const add = shader => {
  const existingId = findShaderId(shaders, shader);
  const id = existingId || _uid ++;
  let promise;
  if (!existingId) {
    const d = defer();
    names[id] = shader.name;
    shaders[id] = shader;
    shadersReferenceCounters[id] = 0;
    shadersCompileResponses[id] = promise = d.promise;
    Shaders.emit("add", id, shader, (error, result) => {
      if (error)
        d.reject(error);
      else
        d.resolve(result);
    });
  }
  else {
    promise = shadersCompileResponses[id];
  }
  return { id, promise };
};

const remove = id => {
  delete shaders[id];
  delete names[id];
  delete shadersReferenceCounters[id];
  delete shadersCompileResponses[id];
  Shaders.emit("remove", id);
};

const getShadersToRemove = () =>
  Object.keys(shadersReferenceCounters)
  .filter(id => shadersReferenceCounters[id] <= 0)
  .map(id => parseInt(id, 10));

let scheduled;
const gcNow = () => {
  clearTimeout(scheduled);
  getShadersToRemove().forEach(remove);
};
const scheduleGC = () => {
  // debounce the shader deletion to let a last chance to a future dup shader to appear
  // the idea is also to postpone this operation when the app is not so busy
  const noDebounce = getShadersToRemove().length > 20;
  if (!noDebounce) clearTimeout(scheduled);
  scheduled = setTimeout(gcNow, 500);
};

const sameShader = (a, b) => a.frag === b.frag;

const findShaderId = (shaders, shader) => {
  for (let id in shaders) {
    if (sameShader(shaders[id], shader)) {
      return parseInt(id, 10);
    }
  }
  return null;
};

const logError = name => error =>
  console.error( //eslint-disable-line no-console
    "Shader '" + name + "' failed to compile:\n" + error
  );

const Shaders = {

  _onSurfaceWillMount (surfaceId) {
    surfaceInlines[surfaceId] = [];
  },

  _onSurfaceWillUnmount (surfaceId) {
    surfaceInlines[surfaceId].forEach(id =>
      shadersReferenceCounters[id]--);
    delete surfaceInlines[surfaceId];
    delete previousSurfaceInlines[surfaceId];
    scheduleGC();
  },

  _beforeSurfaceBuild (surfaceId) {
    previousSurfaceInlines[surfaceId] = surfaceInlines[surfaceId];
    surfaceInlines[surfaceId] = [];
  },

  // Resolve the shader field of GL.Node.
  // it can be an id (created with Shaders.create) or an inline object.
  _resolve (idOrObject, surfaceId, compileHandler) {
    if (typeof idOrObject === "number") return idOrObject;
    const { id, promise } = add({ name: INLINE_NAME, ...idOrObject });
    if (compileHandler) {
      promise.then(
        result => compileHandler(null, result),
        error => compileHandler(error));
    }
    else {
      promise.catch(logError(Shaders.getName(id)));
    }
    const inlines = surfaceInlines[surfaceId];
    inlines.push(id);
    return id;
  },

  _afterSurfaceBuild (surfaceId) {
    previousSurfaceInlines[surfaceId].forEach(id =>
      shadersReferenceCounters[id]--);
    surfaceInlines[surfaceId].forEach(id =>
      shadersReferenceCounters[id]++);
    delete previousSurfaceInlines[surfaceId];
    scheduleGC();
  },

  // Exposed methods

  create (obj, onAllCompile) {
    invariant(typeof obj === "object", "config must be an object");
    const result = {};
    const compileErrors = {}, compileResults = {};
    Promise.all(Object.keys(obj).map(key => {
      const shader = obj[key];
      invariant(typeof shader === "object" && typeof shader.frag === "string",
      "invalid shader given to Shaders.create(). A valid shader is a { frag: String }");
      const {id, promise} = add({ name: key, ...shader });
      result[key] = id;
      shadersReferenceCounters[id] ++;
      return promise.then(
        result => compileResults[key] = result,
        error => compileErrors[key] = error
      );
    }))
    .then(() => {
      if (onAllCompile) {
        onAllCompile(
          Object.keys(compileErrors).length ? compileErrors : null,
          compileResults);
      }
      else {
        Object.keys(compileErrors).forEach(key =>
          logError(Shaders.getName(result[key]))(compileErrors[key]));
      }
    });
    return result;
  },

  get (id) {
    return Object.freeze(shaders[id]);
  },

  getName (id) {
    return names[id];
  },

  list () {
    return Object.keys(shaders);
  },

  exists (id) {
    return id in shaders;
  },

  gcNow,

  ...EventEmitter.prototype
};

EventEmitter.call(Shaders);

module.exports = Shaders;
