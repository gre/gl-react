import { useState, useEffect, useRef } from "react";

export function useTimeLoop(refreshRate = 60) {
  const [state, setState] = useState({ time: 0, tick: 0 });
  const rafRef = useRef<number>();

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [refreshRate]);

  return state;
}
