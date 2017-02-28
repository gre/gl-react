package fr.greweb.rngl;

import com.facebook.soloader.SoLoader;

// Java bindings for EXGL.h interface
public class EXGL {
  static {
    SoLoader.loadLibrary("exgl");
  }
  public static native int EXGLContextCreate(long jsCtxPtr);
  public static native void EXGLContextDestroy(int exglCtxId);
  public static native void EXGLContextFlush(int exglCtxId);
}
