declare module "react-native" {
  export const View: any;
}
declare const __DEV__: boolean;
declare var global: typeof globalThis & {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
};
