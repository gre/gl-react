declare module "react-native" {
  export const View: any;
}
declare var global: typeof globalThis & {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
};
