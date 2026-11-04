// Catches the startup crashes of the Expo apps that bundling alone can't see,
// since CI never runs the bundle. Usage: check-expo-bundle.mjs <app dir> <bundle>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const [appDir, bundlePath] = process.argv.slice(2);
const bundle = readFileSync(bundlePath, "utf8");
const require = createRequire(resolve(appDir, "package.json"));
const errors = [];

// react-native's renderer throws at startup unless react is this exact version.
const renderer = bundle.match(
  /"(\d+\.\d+\.\d+)"!==\w+\)throw Error\('Incompatible React versions/
);
const react = require("react/package.json").version;
if (!renderer) {
  errors.push("could not find the React version the renderer requires");
} else if (renderer[1] !== react) {
  errors.push(`react is ${react}, react-native requires exactly ${renderer[1]}`);
}

// Only newer expo-gl versions use this native module, which Expo SDK 54 lacks.
if (/["']ExpoGL["']/.test(bundle)) {
  errors.push("the bundle has an expo-gl version incompatible with this SDK");
}

if (errors.length) {
  console.error(errors.map((e) => `error: ${e}`).join("\n"));
  process.exit(1);
}
console.log(`OK: react ${react} matches the renderer, expo-gl is the SDK's`);
