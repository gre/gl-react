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
  // Redirect singleton packages to cookbook-expo's node_modules
  // to prevent the monorepo root's older React from being bundled.
  const singletonPkg = singletonPkgs.find(
    (pkg) => moduleName === pkg || moduleName.startsWith(pkg + "/"),
  );
  if (singletonPkg) {
    // Re-resolve with an origin inside cookbook-expo so Metro finds the local copy
    const fakeOrigin = path.resolve(projectRoot, "index.ts");
    return context.resolveRequest(
      { ...context, originModulePath: fakeOrigin },
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
