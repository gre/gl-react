import { useCallback, useState } from "react";
import type { GestureResponderEvent } from "react-native";

// Helper: normalize a touch event to UV (0..1, Y-flipped) given a layout
// pixel width/height of the surface area. RN nativeEvent has locationX/Y
// relative to the receiving view; when we attach the responder to the same
// View that wraps the Surface, this works directly.
export function eventToUV(
  e: GestureResponderEvent,
  width: number,
  height: number
): [number, number] {
  const { locationX, locationY } = e.nativeEvent;
  return [
    Math.min(1, Math.max(0, locationX / width)),
    Math.min(1, Math.max(0, 1 - locationY / height)),
  ];
}

export function usePointerUV(width: number, height: number, initial: [number, number] = [0.5, 0.5]) {
  const [uv, setUV] = useState<[number, number]>(initial);
  const handlers = {
    onStartShouldSetResponder: useCallback(() => true, []),
    onMoveShouldSetResponder: useCallback(() => true, []),
    onResponderMove: useCallback(
      (e: GestureResponderEvent) => setUV(eventToUV(e, width, height)),
      [width, height]
    ),
    onResponderGrant: useCallback(
      (e: GestureResponderEvent) => setUV(eventToUV(e, width, height)),
      [width, height]
    ),
  };
  return { uv, setUV, handlers };
}
