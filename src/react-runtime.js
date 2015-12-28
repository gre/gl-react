const runtime = require("./react-runtime-mutate").get();
if (!runtime) {
  console.warn( // eslint-disable-line no-console
`Please prepend in your JavaScript entry file one of following imports:

${"require"}("gl-react/react")         // for React

  OR

${"require"}("gl-react/react-native")  // for React Native


Make sure to do this BEFORE any other imports. (that are gl-react related)
If you use any ES6 import in that file, please also use import syntax (Babel transpiles import before require syntax).
E.g:
import __ from "gl-react/react-native";


> Note: This mechanism will be removed once React Native depends on React`);

  throw new Error(`[gl-react] React not set: Please import 'gl-react/react' OR 'gl-react/react-native' once at the beginning of your JavaScript entry file`);
}
module.exports = runtime;
