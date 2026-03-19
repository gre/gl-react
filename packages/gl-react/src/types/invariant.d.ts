declare module "invariant" {
  function invariant(
    condition: any,
    message: string,
    ...args: any[]
  ): asserts condition;
  export default invariant;
}
