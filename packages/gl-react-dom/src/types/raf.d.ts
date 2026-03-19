declare module "raf" {
  function raf(callback: FrameRequestCallback): number;
  namespace raf {
    function cancel(id: number): void;
  }
  export default raf;
}
