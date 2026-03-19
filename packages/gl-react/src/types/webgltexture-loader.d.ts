declare module "webgltexture-loader" {
  export interface WebGLTextureLoaderResult {
    texture: WebGLTexture;
    width: number;
    height: number;
  }

  export interface WebGLTextureLoader<T = any> {
    canLoad(input: any): boolean;
    get(input: T): WebGLTextureLoaderResult | null;
    load(input: T): Promise<WebGLTextureLoaderResult>;
    update(input: T): void;
    dispose(): void;
  }

  export class LoaderResolver {
    constructor(gl: WebGLRenderingContext);
    resolve(input: any): WebGLTextureLoader | null;
    dispose(): void;
  }
}

declare module "webgltexture-loader-ndarray" {}
declare module "webgltexture-loader-dom" {}
declare module "webgltexture-loader-expo" {}
