// This example is its own project, outside the repository's pnpm workspace.
// Without this, Next uses the repository root as the project root, and the page
// crashes with "Cannot destructure property 'glSurface' of 'this.context'".
module.exports = {
  turbopack: { root: __dirname },
};
