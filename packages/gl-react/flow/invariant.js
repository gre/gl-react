//@flow

declare module "invariant" {
  declare var exports: (cond:any, msg:string, ...rest:any) => void;
}
