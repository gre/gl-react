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

// Force single copies of react/react-native from this package's node_modules
// to prevent monorepo root copies from being bundled alongside.
const singletonPkgs = ["react", "react-dom", "react-native"];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // With watchFolders = [monorepoRoot], Metro resolves the entry "./index"
  // from the monorepo root instead of this package. Redirect to our index.ts.
  if (
    moduleName === "./index" &&
    context.originModulePath === monorepoRoot + "/."
  ) {
    return {
      type: "sourceFile",
      filePath: path.resolve(projectRoot, "index.ts"),
    };
  }
  if (
    moduleName === "webgltexture-loader-ndarray" ||
    moduleName === "ndarray" ||
    moduleName === "ndarray-ops" ||
    moduleName === "typedarray-pool"
  ) {
    return { type: "sourceFile", filePath: emptyModule };
  }
  // Redirect singleton packages to this package's node_modules
  // to prevent the monorepo root's older React from being bundled.
  const singletonPkg = singletonPkgs.find(
    (pkg) => moduleName === pkg || moduleName.startsWith(pkg + "/")
  );
  if (singletonPkg) {
    const fakeOrigin = path.resolve(projectRoot, "index.ts");
    return context.resolveRequest(
      { ...context, originModulePath: fakeOrigin },
      moduleName,
      platform
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
