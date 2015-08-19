const GlslTransitions = require("glsl-transitions");
const byName = {};
GlslTransitions.forEach(function (t) {
  byName[t.name] = t;
});
const transitions = [
  [ "cube", function () {
    return { persp: 0.9 - Math.random()*Math.random(), unzoom: Math.random()*Math.random() };
  } ],
  "undulating burn out",
  [ "CrossZoom", function () {
    return { strength: 0.5 * Math.random() };
  } ],
  "glitch displace",
  [ "Mosaic", function () {
    let dx = Math.round(Math.random() * 6 - 3), dy = Math.round(Math.random() * 6 - 3);
    if (dx===0 && dy===0) dy = -1;
    return { endx: dx, endy: dy };
  } ],
  [ "DoomScreenTransition", function () {
    return {
      barWidth: Math.round(6 + 20 * Math.random()),
      amplitude: 2 * Math.random(),
      noise: 0.5 * Math.random(),
      frequency: Math.random()
    };
  } ],
  [ "colourDistance", function () {
    return { interpolationPower: 6 * Math.random() };
  } ],
  "swap",
  [ "doorway", function () {
    return { perspective: Math.random() * Math.random(), depth: 1 + 10 * Math.random() * Math.random() };
  } ],
  "Star Wipe",
  "pinwheel",
  "SimpleFlip",
  "TilesScanline",
  "Dreamy",
  "Swirl",
  "burn",
  "Radial",
  [ "ripple", function () {
    return {
      amplitude: 200 * Math.random(),
      speed: 200 * Math.random()
    };
  } ],
  "morph",
  ["ButterflyWaveScrawler", function () {
    return {
      amplitude: Math.random(),
      waves: 50 * Math.random() * Math.random(),
      colorSeparation: 0.8 * Math.random() * Math.random()
    };
  } ],
  [ "flash", function () {
    return { flashIntensity: 4 * Math.random() };
  } ],
  [ "randomsquares", function () {
    const size = Math.round(4 + 20 * Math.random());
    return {
      size: [ size, size ],
      smoothness: Math.random()
    };
  } ],
  [ "flyeye", function () {
    return {
      size: Math.random() * Math.random(),
      zoom: 200 * Math.random() * Math.random(),
      colorSeparation: 0.8 * Math.random() * Math.random()
    };
  } ],
  "squeeze",
  [ "directionalwipe", function () {
    const angle = Math.random() * 2 * Math.PI;
    return {
      direction: [ Math.cos(angle), Math.sin(angle) ]
    };
  } ],
  "circleopen",
  [ "wind", function () {
    return { size: 0.1+0.2 * Math.random() };
  } ]
].map(function (obj) {
  let name, genUniforms;
  if (typeof obj === "string")
    name = obj;
  else {
    name = obj[0];
    genUniforms = obj[1];
  }
  if (!(name in byName)) throw new Error("no transition called "+name);
  const t = byName[name];
  return {
    transition: t,
    name: name,
    genUniforms: function () {
      return genUniforms ? {
        ...t.uniforms,
        ...genUniforms()
      } : t.uniforms;
    }
  };
});

function random () {
  const i = Math.floor(Math.random() * transitions.length);
  const t = transitions[i];
  const uniforms = t.genUniforms && t.genUniforms() || {};
  return {
    name: t.name,
    uniforms: uniforms
  };
}

const shaders = {};
transitions.forEach(function (o) {
  shaders[o.name] = { frag: o.transition.glsl };
});

module.exports = {
  shaders: shaders,
  random: random
};
