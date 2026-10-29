#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Reports the division (fold) region of a partly folded iPhone Duo, in window
// points, to JS. Contract: docs/plans/iphone-duo-controls-and-fold-plan.md.
@interface HolocronFold : RCTEventEmitter <RCTBridgeModule>
@end
