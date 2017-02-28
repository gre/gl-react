#import "EXGLViewManager.h"

#import "EXGLView.h"

@implementation EXGLViewManager

RCT_EXPORT_MODULE(EXGLViewManager);

- (UIView *)view
{
  return [[EXGLView alloc] initWithManager:self];
}

RCT_EXPORT_VIEW_PROPERTY(onSurfaceCreate, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(msaaSamples, NSNumber);

@end
