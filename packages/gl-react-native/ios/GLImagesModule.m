#import <React/RCTConvert.h>
#import <React/RCTLog.h>
#import <React/RCTImageSource.h>
#import <React/RCTBridge.h>
#import <React/RCTImageLoader.h>
#import <React/RCTUtils.h>
#import "GLImagesModule.h"
#import "GLImages.h"

@implementation GLImagesModule

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()


RCT_EXPORT_METHOD(load:(nonnull RCTImageSource *)source
                  withGLAssetId: (int) glAssetId
                  withCallback:(RCTResponseSenderBlock)cb) {
    //RCTImageLoaderCancellationBlock cancellation =
    [_bridge.imageLoader loadImageWithURLRequest:source.request
                                            size:CGSizeZero
                                           scale:0
                                         clipped:YES
                                      resizeMode:RCTResizeModeStretch
                                   progressBlock:nil
                                partialLoadBlock:nil
                                 completionBlock:^(NSError *error, UIImage *loadedImage) {
                                     void (^setImageBlock)(UIImage *) = ^(UIImage *image) {
                                         int width = image.size.width;
                                         int height = image.size.height;
                                         GLubyte* data = malloc(width * height * 4);
                                         CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
                                         CGContextRef ctx = CGBitmapContextCreate(data, width, height, 8, width * 4, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
                                         if (ctx == NULL) {
                                             RCTLogError(@"unable to create the bitmap context");
                                             CGColorSpaceRelease(colorSpace);
                                             free(data);
                                             return;
                                         }
                                         CGRect rect = CGRectMake(0.0, 0.0, width, height);
                                         CGContextClearRect(ctx, rect);
                                         CGContextDrawImage(ctx, rect, image.CGImage);
                                         CGColorSpaceRelease(colorSpace);
                                         CGContextRelease(ctx);
                                         GLImagesSet(glAssetId, data, width, height);
                                         cb(@[ @(glAssetId), @(width), @(height) ]);
                                     };
                                     if (error) {
                                         NSLog(@"Image failed to load: %@", error);
                                     } else {
                                         if ([NSThread isMainThread]) {
                                             setImageBlock(loadedImage);
                                         } else {
                                             RCTExecuteOnMainQueue(^{
                                                 setImageBlock(loadedImage);
                                             });
                                         }
                                     }
                                 }];
}


RCT_EXPORT_METHOD(unload:(int) glAssetId) {
  GLAsset *asset = GLImagesGet(glAssetId);
  if (asset) {
    free(asset->data);
  }
  GLImagesRemove(glAssetId);
}

@end

@implementation RCTBridge (GLImagesModule)

- (GLImagesModule *)glAssetsRegister
{
  return [self moduleForClass:[GLImagesModule class]];
}

@end
