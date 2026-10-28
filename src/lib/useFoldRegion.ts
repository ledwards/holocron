import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import {Region} from './duoLayout';

/**
 * The display's fold region in window points while iPhone Duo is partly
 * folded, else null.
 *
 * Read from the optional native module `HolocronFold` (contract in
 * docs/plans/iphone-duo-controls-and-fold-plan.md), which wraps iOS 27.1's
 * reserved-region API. Without that module this returns null and every pane
 * lays out exactly as on a flat display.
 */
export default function useFoldRegion(): Region | null {
  const [fold, setFold] = useState<Region | null>(null);

  useEffect(() => {
    const module = NativeModules.HolocronFold;
    if (!module) {
      return undefined;
    }
    let active = true;
    module.getDivisionRegion?.().then((region: Region | null) => {
      if (active) setFold(region || null);
    }).catch(() => undefined);
    const emitter = new NativeEventEmitter(module);
    const subscription = emitter.addListener('holocronFoldChanged', (region: Region | null) => {
      setFold(region || null);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return fold;
}
