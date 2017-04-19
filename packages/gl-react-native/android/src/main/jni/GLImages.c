#include <stdlib.h>
#include <stdint.h>
#include <jni.h>
#include <android/bitmap.h>
#include "GLImages.h"

JNIEXPORT void JNICALL
Java_fr_greweb_rngl_GLImages_set
(JNIEnv *env, jclass clazz, jint glAssetId, jobject bitmap) {
  AndroidBitmapInfo bitmapInfo;
  AndroidBitmap_getInfo(env, bitmap, &bitmapInfo);
  uint32_t width = bitmapInfo.width;
  uint32_t height = bitmapInfo.height;
  uint32_t size = width * height * 4;
  void* data = malloc(size);
  void* bitmapPixels;
  AndroidBitmap_lockPixels(env, bitmap, &bitmapPixels);
  memcpy(data, bitmapPixels, size);
  AndroidBitmap_unlockPixels(env, bitmap);
  GLImagesSet(glAssetId, data, width, height);
}

JNIEXPORT void JNICALL
Java_fr_greweb_rngl_GLImages_remove
(JNIEnv *env, jclass clazz, jint glAssetId) {
  GLAsset *asset = GLImagesGet(glAssetId);
  if (asset) {
    free(asset->data);
  }
  GLImagesRemove(glAssetId);
}
