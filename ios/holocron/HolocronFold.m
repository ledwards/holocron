#import "HolocronFold.h"

#import <UIKit/UIKit.h>

// UIHingeInteraction and reservedRegionsOfKind: exist from the iOS 27.1 SDK.
// Older SDKs compile this module as a stub that always reports no fold.
#if __has_include(<UIKit/UIHingeInteraction.h>)
#define HOLOCRON_HAS_FOLD_API 1
#else
#define HOLOCRON_HAS_FOLD_API 0
#endif

static NSString *const HolocronFoldChanged = @"holocronFoldChanged";

@interface HolocronFold ()
/// UIHingeStatus of the last hinge update; 0 (unknown) until the first one.
@property (nonatomic) NSInteger hingeStatusValue;
@end

@implementation HolocronFold {
  BOOL _hasListeners;
  BOOL _hasLast;
  CGRect _last;
#if HOLOCRON_HAS_FOLD_API
  id _hingeInteraction;
  __weak UIView *_observedView;
#endif
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[ HolocronFoldChanged ];
}

- (void)startObserving
{
  _hasListeners = YES;
  [self attachWhenReady];
}

- (void)stopObserving
{
  _hasListeners = NO;
}

#pragma mark - Region

- (UIView *)rootView
{
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    for (UIWindow *window in ((UIWindowScene *)scene).windows) {
      if (window.isKeyWindow && window.rootViewController.view) {
        return window.rootViewController.view;
      }
    }
  }
  return nil;
}

/// The active division region in the root view's (= window's) coordinates, or
/// NO when the display is flat or closed.
- (BOOL)currentRegion:(CGRect *)out
{
#if HOLOCRON_HAS_FOLD_API
  if (@available(iOS 27.1, *)) {
    UIView *root = [self rootView];
    if (!root) {
      return NO;
    }
    // The hinge status decides whether the display is folded; a region can
    // still be reported active while the device is flat or closed.
    if (self.hingeStatusValue != UIHingeStatusPartiallyOpen) {
      return NO;
    }
    NSArray<UIViewReservedRegion *> *regions =
        [root reservedRegionsOfKind:UIViewReservedRegionKind.divisionRegionKind];
    for (UIViewReservedRegion *region in regions) {
      CGRect frame = region.frame;
      if (region.isActive && frame.size.width > 0 && frame.size.height > 0) {
        *out = frame;
        return YES;
      }
    }
  }
#endif
  return NO;
}

static NSDictionary *HolocronFoldPayload(CGRect r)
{
  return @{@"x" : @(r.origin.x), @"y" : @(r.origin.y), @"width" : @(r.size.width), @"height" : @(r.size.height)};
}

RCT_REMAP_METHOD(getDivisionRegion,
                 getDivisionRegionWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [self attachWhenReady];
  CGRect region;
  resolve([self currentRegion:&region] ? HolocronFoldPayload(region) : [NSNull null]);
}

/// Re-reads the region and tells JS only when it changed.
- (void)refresh
{
  CGRect region = CGRectZero;
  BOOL has = [self currentRegion:&region];
  if (has == _hasLast && (!has || CGRectEqualToRect(region, _last))) {
    return;
  }
  _hasLast = has;
  _last = region;
  if (_hasListeners) {
    [self sendEventWithName:HolocronFoldChanged body:has ? HolocronFoldPayload(region) : [NSNull null]];
  }
}

#pragma mark - Observing

- (void)attachWhenReady
{
#if HOLOCRON_HAS_FOLD_API
  if (@available(iOS 27.1, *)) {
    UIView *root = [self rootView];
    if (!root) {
      // The window is not key yet during early startup; try again shortly.
      __weak HolocronFold *weakSelf = self;
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.25 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [weakSelf attachWhenReady];
      });
      return;
    }
    if (_observedView == root) {
      return;
    }
    if (_hingeInteraction && _observedView) {
      [_observedView removeInteraction:_hingeInteraction];
    }
    __weak HolocronFold *weakSelf = self;
    UIHingeInteraction *interaction =
        [[UIHingeInteraction alloc] initWithUpdateHandler:^(UIHingeInteraction *_, UIHingeInteractionUpdate *update) {
          // The region follows the hinge, and rotation moves it without the
          // hinge changing, so also re-read after the next layout pass.
          weakSelf.hingeStatusValue = update.hinge ? update.hinge.status : UIHingeStatusUnknown;
          [weakSelf refresh];
          dispatch_async(dispatch_get_main_queue(), ^{
            [weakSelf refresh];
          });
        }];
    [root addInteraction:interaction];
    _hingeInteraction = interaction;
    _observedView = root;

    NSNotificationCenter *center = NSNotificationCenter.defaultCenter;
    [center removeObserver:self];
    for (NSNotificationName name in @[ UIApplicationDidBecomeActiveNotification, UIDeviceOrientationDidChangeNotification ]) {
      [center addObserver:self selector:@selector(refreshSoon) name:name object:nil];
    }
  }
#endif
}

- (void)refreshSoon
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [self refresh];
  });
  __weak HolocronFold *weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [weakSelf refresh];
  });
}

- (void)invalidate
{
  [NSNotificationCenter.defaultCenter removeObserver:self];
  [super invalidate];
}

@end
