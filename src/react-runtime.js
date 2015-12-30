const runtime = require("./react-runtime-mutate").get();
if (!runtime) {
  const reqSyntax = name => `requ${"i"}re("${name}")`;
  const importSyntax = name => `${"i"}mport "${name}"`;
  // ^^^ have to do this crap because of RN packager
  console.warn( // eslint-disable-line no-console
`Please prepend in your JavaScript entry file one of following imports:

${reqSyntax("gl-react/react")}         // for React

  OR

${reqSyntax("gl-react/react-native")}  // for React Native


Make sure to do this BEFORE any other imports. (that are gl-react related)
If you use any ES6 import in that file, please also use import syntax (Babel transpiles import before require syntax).
E.g:
${importSyntax("gl-react/react-native")}


> Note: This mechanism will be removed once React Native depends on React`);

  throw new Error(`[gl-react] React not set: Please ${reqSyntax("gl-react/react")} OR ${reqSyntax("gl-react/react-native")} once at the beginning of your JavaScript entry file`);
}
module.exports = runtime;
