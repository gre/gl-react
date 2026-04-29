// Patched version of webgltexture-loader-expo-camera for Expo SDK 54.
// The npm package checks `input instanceof Camera`, but Camera is no longer
// a component class in modern Expo. CameraView is the replacement.
import {
  WebGLTextureLoaderAsyncHashCache,
  globalRegistry,
} from "webgltexture-loader";
import { findNodeHandle } from "react-native";
import { CameraView } from "expo-camera";

const neverEnding = new Promise<never>(() => {});

// Probe whether expo's ExponentGLObjectManager native module exposes
// createCameraTextureAsync — it's been quietly dropped from Expo Go on some
// SDK versions and that's how the camera texture binding fails silently.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { requireNativeModule } = require("expo-modules-core");
  const m = requireNativeModule("ExponentGLObjectManager");
  console.log(
    "[CamLoader] ExponentGLObjectManager exists?",
    !!m,
    "createCameraTextureAsync?",
    typeof m?.createCameraTextureAsync,
    "createObjectAsync?",
    typeof m?.createObjectAsync,
    "destroyObjectAsync?",
    typeof m?.destroyObjectAsync,
  );
} catch (e: any) {
  console.log(
    "[CamLoader] requireNativeModule(ExponentGLObjectManager) threw:",
    e?.message || e,
  );
}

let _canLoadLogged = false;
let _inputHashLogged = false;
let _loadCalled = false;

class CameraViewTextureLoader extends (WebGLTextureLoaderAsyncHashCache as any) {
  static priority = -199;
  objIds = new WeakMap();

  canLoad(input: any) {
    const ok = input != null && input instanceof CameraView;
    if (!_canLoadLogged) {
      _canLoadLogged = true;
      console.log(
        "[CamLoader] canLoad (first)",
        ok,
        "ctor=",
        input?.constructor?.name,
      );
    }
    return ok;
  }

  disposeTexture(texture: any) {
    const id = this.objIds.get(texture);
    if (id) {
      const glView = (this as any).gl?.getExtension("GLViewRef");
      if (glView?.destroyObjectAsync) {
        glView.destroyObjectAsync({ id });
      }
    }
    this.objIds.delete(texture);
  }

  inputHash(camera: any) {
    const tag = findNodeHandle(camera);
    if (!_inputHashLogged) {
      _inputHashLogged = true;
      console.log("[CamLoader] inputHash (first) =>", tag);
    }
    return tag;
  }

  load(input: any) {
    if (!_loadCalled) {
      _loadCalled = true;
      console.log("[CamLoader] load() called by gl-react");
    }
    return super.load(input);
  }

  loadNoCache(camera: any) {
    const { gl } = this as any;
    let disposed = false;
    const dispose = () => {
      disposed = true;
    };
    const glView = gl?.getExtension("GLViewRef");
    const exglCtxId = glView?.exglCtxId;
    if (!glView || !exglCtxId) {
      return {
        promise: Promise.reject(
          new Error("GLViewRef or exglCtxId not available"),
        ),
        dispose,
      };
    }
    // Bypass expo-gl's GLView.createCameraTextureAsync — its closure-captured
    // ExponentGLObjectManager is undefined at runtime in Expo Go SDK 54
    // (TDZ / load-order quirk), so we invoke the native module directly here.
    const cameraTag = findNodeHandle(camera);
    const promise = (async () => {
      const { requireNativeModule } = require("expo-modules-core");
      const eom = requireNativeModule("ExponentGLObjectManager");
      const result = await eom.createCameraTextureAsync(exglCtxId, cameraTag);
      if (disposed) return neverEnding as any;
      console.log(
        "[CamLoader] native result:",
        JSON.stringify(result),
        "keys=",
        result ? Object.keys(result) : null,
      );
      const exglObjId = result.exglObjId ?? result.id;
      const WGT: any = (globalThis as any).WebGLTexture;
      // Construct via WebGLTexture so gl.bindTexture's instance check passes,
      // then set `.id` ourselves — the SDK 54 constructor ignores its argument.
      const texture: any = WGT ? new WGT() : {};
      texture.id = exglObjId;
      console.log(
        "[CamLoader] wrapped texture id=",
        texture.id,
        "instanceofWGT=",
        WGT ? texture instanceof WGT : "no-WGT",
      );
      this.objIds.set(texture, exglObjId);
      return { texture, width: 0, height: 0 };
    })();
    return { promise, dispose };
  }
}

globalRegistry.add(CameraViewTextureLoader);
console.log("[CamLoader] registered with globalRegistry");

export default CameraViewTextureLoader;
