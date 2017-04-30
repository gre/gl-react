export default gl => {
  // WEBGL_lose_context helps browser to GC the context. see https://jsfiddle.net/greweb/j9709k67/
  const loseContextExt = gl.getExtension("WEBGL_lose_context");
  if (loseContextExt) loseContextExt.loseContext();
};
