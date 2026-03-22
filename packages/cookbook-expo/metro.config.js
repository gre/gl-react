const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Stub out Node.js-only packages that gl-react imports unconditionally
// but are not needed (and crash Hermes) in React Native.
const emptyModule = require.resolve("./empty-module");

// Force single copies of react/react-native from cookbook-expo's node_modules
// to prevent monorepo root copies from being bundled alongside.
const singletonPkgs = ["react", "react-dom", "react-native"];
const singletonMap = {};
for (const pkg of singletonPkgs) {
  singletonMap[pkg] = path.resolve(projectRoot, "node_modules", pkg);
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "webgltexture-loader-ndarray" ||
    moduleName === "ndarray" ||
    moduleName === "ndarray-ops" ||
    moduleName === "typedarray-pool"
  ) {
    return { type: "sourceFile", filePath: emptyModule };
  }
  // Redirect singleton packages to cookbook-expo's copies
  if (singletonMap[moduleName]) {
    return context.resolveRequest(
      { ...context, nodeModulesPaths: [path.resolve(projectRoot, "node_modules")] },
      moduleName,
      platform,
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
