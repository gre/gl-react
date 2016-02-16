module.exports = (object, keys) => {
  const o = {};
  keys.forEach(k => {
    if (object.hasOwnProperty(k))
      o[k] = object[k];
  });
  return o;
};
