// Runs one Expo cookbook on a booted Android emulator through Maestro, one
// scenario at a time, and fails on any JS error or crash found in logcat.
// Maestro alone isn't enough: most errors leave the screen looking fine.
//
// Usage: expo-android-smoke.mjs <cookbook-expo|cookbook-expo-camera> <apk> <output dir> [scenario...]
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [app, apk, outArg, ...only] = process.argv.slice(2);
if (!app || !apk || !outArg) {
  console.error("usage: expo-android-smoke.mjs <app> <apk> <output dir> [scenario...]");
  process.exit(2);
}

const outDir = resolve(outArg);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const flows = join(root, ".github/maestro", app);
const appDir = join(root, "packages", app);
const appPackage = JSON.parse(readFileSync(join(appDir, "app.json"), "utf8")).expo
  .android.package;

// Errors that are expected in an example on the CI emulator. Each entry needs a
// reason, and only applies to that example: never loosen the patterns below.
const knownIssues = {};

// Leaving these examples crashes the app: expo-gl 16 hits a NullPointerException
// in GLCameraObject (SurfaceTexture.updateTexImage) once the camera is destroyed.
// Open them without leaving, and remove this list once that is fixed.
const crashWhenLeaving = new Set(["webcam", "webcampersistence", "golwebcam"]);

const SCENARIO_TIMEOUT_MS = 5 * 60 * 1000;

function scenarios() {
  if (app === "cookbook-expo-camera") {
    return [
      { name: "denied", flow: "denied.yaml" },
      { name: "granted", flow: "granted.yaml" },
    ];
  }
  const registry = readFileSync(join(appDir, "examples/index.ts"), "utf8");
  const ids = [...registry.matchAll(/^\s+id: "([^"]+)"/gm)].map((m) => m[1]);
  if (!ids.length) throw new Error("no examples found in examples/index.ts");
  return [
    { name: "home", flow: "home.yaml", required: true },
    ...ids.map((id) => ({
      name: id,
      flow: "open-example.yaml",
      leaveFlow: crashWhenLeaving.has(id) ? undefined : "leave-example.yaml",
      env: { EXAMPLE_ID: id },
    })),
  ];
}

const adb = (...args) => spawnSync("adb", args, { encoding: "buffer", maxBuffer: 1 << 28 });

// Returns the problems found in a logcat dump.
function findProblems(logcat) {
  const lines = logcat.split("\n");
  const own = (line) => line.includes(appPackage);
  const problems = [];
  lines.forEach((line, i) => {
    if (
      / E ReactNativeJS: /.test(line) ||
      /JavascriptException/.test(line) ||
      /possible unhandled promise rejection/i.test(line) ||
      (/ F libc\s*: Fatal signal/.test(line) && own(line)) ||
      (/ANR in /.test(line) && own(line)) ||
      (/FATAL EXCEPTION/.test(line) && lines.slice(i, i + 3).some(own))
    ) {
      problems.push(line.trim());
    }
  });
  return problems;
}

function runMaestro(scenario, flow) {
  const envArgs = Object.entries(scenario.env ?? {}).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
  const debugDir = join(outDir, "maestro", scenario.name);
  const result = spawnSync("maestro", ["test", ...envArgs, "--debug-output", debugDir, join(flows, flow)], {
    encoding: "utf8",
    timeout: SCENARIO_TIMEOUT_MS,
    maxBuffer: 1 << 26,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  writeFileSync(join(outDir, `${scenario.name}.maestro.txt`), `${output}\n`, { flag: "a" });
  if (result.status === 0) return null;
  const reasons = output.split("\n").filter((l) => /FAILED|Exception/.test(l)).slice(0, 3);
  return `maestro failed on ${flow} (${result.error?.code ?? result.status}): ${reasons.join(" | ")}`;
}

function run(scenario) {
  const started = Date.now();
  adb("logcat", "-c");

  const maestroError = runMaestro(scenario, scenario.flow);
  // Taken here, not by Maestro: its screenshot call fails while a heavy shader
  // keeps the emulator's software GPU busy, which says nothing about the app.
  writeFileSync(join(outDir, `${scenario.name}.png`), adb("exec-out", "screencap", "-p").stdout);
  const leaveError = !maestroError && scenario.leaveFlow && runMaestro(scenario, scenario.leaveFlow);

  const logcat = adb("logcat", "-d", "-v", "threadtime").stdout.toString();
  writeFileSync(join(outDir, `${scenario.name}.logcat.txt`), logcat);

  const ignored = knownIssues[scenario.name] ?? [];
  const errors = findProblems(logcat).filter(
    (line) => !ignored.some(({ pattern }) => pattern.test(line))
  );
  if (maestroError || leaveError) errors.unshift(maestroError || leaveError);
  return { ...scenario, errors, seconds: Math.round((Date.now() - started) / 1000) };
}

mkdirSync(outDir, { recursive: true });

// A slow system app's "isn't responding" dialog would cover the app under test.
// The app's own crashes and ANRs are still detected from logcat.
adb("shell", "settings", "put", "global", "hide_error_dialogs", "1");

const install = adb("install", "-r", "-g", apk);
if (install.status !== 0) {
  console.error(`adb install failed: ${install.stderr}`);
  process.exit(1);
}

const all = scenarios();
const selected = only.length ? all.filter((s) => only.includes(s.name)) : all;
const results = [];
for (const scenario of selected) {
  const result = run(scenario);
  results.push(result);
  console.log(`${result.errors.length ? "FAIL" : "ok  "} ${result.name} (${result.seconds}s)`);
  for (const error of result.errors.slice(0, 5)) console.log(`     ${error.slice(0, 400)}`);
  if (result.errors.length && result.required) {
    console.log("The app can't start: skipping the other scenarios.");
    break;
  }
}

const failed = results.filter((r) => r.errors.length);
writeFileSync(join(outDir, "summary.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${selected.length} scenarios passed for ${app}`);
if (failed.length) console.log(`Failed: ${failed.map((r) => r.name).join(", ")}`);
process.exit(failed.length || results.length !== selected.length ? 1 : 0);
