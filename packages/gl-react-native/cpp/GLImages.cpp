#include "GLImages.h"
#include <stdlib.h>
#include <memory>
#include <unordered_map>
#include <mutex>

static std::unordered_map<int, GLAsset*> GLImagesMap;

void GLImagesSet(int glAssetId, void* data, int width, int height) {
    GLAsset* asset = new GLAsset();
    asset->data = data;
    asset->width = width;
    asset->height = height;
    GLImagesMap[glAssetId] = asset;
}

void GLImagesRemove(int glAssetId) {
    GLAsset *asset = GLImagesGet(glAssetId);
    if (asset) {
      if (asset->lazyFlippedData) {
        // FIXME mmh this was not malloc-ed here. a good practice would be to keep it with the malloc. move the malloc responsible code in another function here..
        free(asset->lazyFlippedData);
      }
    }
    GLImagesMap.erase(glAssetId);
}

GLAsset* GLImagesGet(int glAssetId) {
    auto iter = GLImagesMap.find(glAssetId);
    if (iter != GLImagesMap.end()) {
        return iter->second;
    }
    return nullptr;
}
