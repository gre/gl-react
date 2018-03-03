//@flow

declare module "invariant" {
  declare module.exports: (cond:any, msg:string, ...rest:any) => void;
}
