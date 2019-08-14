module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    jest: "readonly",
    test: "readonly",
    expect: "readonly"
  },
  parser: "babel-eslint",
  plugins: ["react"],
  rules: {}
};
