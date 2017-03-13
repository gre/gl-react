#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>

@interface GLImagesModule : NSObject <RCTBridgeModule>


@end

@interface RCTBridge (GLImagesModule)

@property (nonatomic, readonly) GLImagesModule *glAssetsRegister;

@end
