import { useState, useEffect, useRef } from "react";

// Drop-in replacement for cookbook-v2's useTimeLoop, RAF-based.
export function useTimeLoop(refreshRate = 60) {
  const [state, setState] = useState({ time: 0, tick: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | undefined;
    let lastTime = -(1000 / refreshRate);
    const interval = 1000 / refreshRate;

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (startTime === undefined) startTime = t;
      if (t - lastTime > interval) {
        lastTime = t;
        setState((prev) => ({
          time: t - startTime!,
          tick: prev.tick + 1,
        }));
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [refreshRate]);

  return state;
}
