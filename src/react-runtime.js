const runtime = require("./react-runtime-mutate").get();
if (!runtime) {
  console.warn( // eslint-disable-line no-console
`Please prepend in your JavaScript entry point one of following imports:

${"require"}("gl-react/react")         // for React

  OR

${"require"}("gl-react/react-native")  // for React Native


Make sure to do this BEFORE any other imports. (that are gl-react related)

> Note: This mechanism will be removed once React Native depends on React`);

  throw new Error("gl-react: React instance not available at runtime. Please read instructions");
}
module.exports = runtime;
