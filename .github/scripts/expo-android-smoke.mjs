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
    ...ids.map((id) => ({ name: id, flow: "example.yaml", env: { EXAMPLE_ID: id } })),
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
      (/FATAL EXCEPTION/.test(line) && lines.slice(i, i + 3).some(own))
    ) {
      problems.push(line.trim());
    }
  });
  return problems;
}

function run(scenario) {
  const started = Date.now();
  adb("logcat", "-c");

  const envArgs = Object.entries(scenario.env ?? {}).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
  const debugDir = join(outDir, "maestro", scenario.name);
  const maestro = spawnSync(
    "maestro",
    ["test", ...envArgs, "--debug-output", debugDir, join(flows, scenario.flow)],
    {
      encoding: "utf8",
      cwd: outDir, // takeScreenshot writes to the current directory
      timeout: SCENARIO_TIMEOUT_MS,
      maxBuffer: 1 << 26,
    }
  );

  const logcat = adb("logcat", "-d", "-v", "threadtime").stdout.toString();
  writeFileSync(join(outDir, `${scenario.name}.logcat.txt`), logcat);
  writeFileSync(
    join(outDir, `${scenario.name}.maestro.txt`),
    `${maestro.stdout ?? ""}\n${maestro.stderr ?? ""}`
  );
  writeFileSync(join(outDir, `${scenario.name}.end.png`), adb("exec-out", "screencap", "-p").stdout);

  const ignored = knownIssues[scenario.name] ?? [];
  const errors = findProblems(logcat).filter(
    (line) => !ignored.some(({ pattern }) => pattern.test(line))
  );
  if (maestro.status !== 0) {
    const tail = `${maestro.stdout ?? ""}`.trim().split("\n").slice(-3).join(" | ");
    errors.unshift(`maestro failed (${maestro.error?.code ?? maestro.status}): ${tail}`);
  }
  return { ...scenario, errors, seconds: Math.round((Date.now() - started) / 1000) };
}

mkdirSync(outDir, { recursive: true });

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
