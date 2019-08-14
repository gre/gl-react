module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: "Last 2 Chrome versions, Firefox ESR",
          node: "current"
        }
      }
    ],
    "@babel/preset-react",
    "@babel/preset-flow"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread"
  ]
};
