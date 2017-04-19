#ifndef __GLASSETS_H__
#define __GLASSETS_H__

typedef struct _GLAsset {
    void *data;
    void *lazyFlippedData;
    int width;
    int height;
} GLAsset;

#ifdef __cplusplus
extern "C" {
#endif
    
    void GLImagesSet(int glAssetId, void *data, int width, int height);
    void GLImagesRemove(int glAssetId);
    GLAsset* GLImagesGet(int glAssetId);

#ifdef __cplusplus
}
#endif


#endif
