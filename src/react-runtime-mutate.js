const invariant = require("invariant");
let runtime;
function set (React) {
  if (React.version) { // RN don't provide version...
    const version = React.version.split(".");
    invariant(version[0]==="0" && parseInt(version[1], 10) >= 14, "React version must be at least 0.14.x. got: %s", React.version);
  }
  runtime = React;
}
module.exports = {
  set,
  get: () => runtime
};
