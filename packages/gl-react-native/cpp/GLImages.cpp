#include "GLImages.h"
#include <memory>
#include <unordered_map>
#include <mutex>

static std::unordered_map<int, GLAsset*> GLImagesMap;
static std::mutex GLImagesMapMutex;

void GLImagesSet(int glAssetId, void* data, int width, int height) {
    std::lock_guard<decltype(GLImagesMapMutex)> lock(GLImagesMapMutex);
    GLAsset* asset = new GLAsset();
    asset->data = data;
    asset->width = width;
    asset->height = height;
    GLImagesMap[glAssetId] = asset;
}

GLAsset* GLImagesGet(int glAssetId) {
    std::lock_guard<decltype(GLImagesMapMutex)> lock(GLImagesMapMutex);
    auto iter = GLImagesMap.find(glAssetId);
    if (iter != GLImagesMap.end()) {
        return iter->second;
    }
    return nullptr;
}
