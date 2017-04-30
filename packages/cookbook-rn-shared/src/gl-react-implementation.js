// inferred from runtime!

let runtime;
export function setRuntime (r) { runtime = r; }
export default () => runtime;
