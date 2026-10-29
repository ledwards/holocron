import {NativeEventEmitter, NativeModules} from 'react-native';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import useFoldRegion from '../useFoldRegion';

const crease = {x: 455.5, y: 0, width: 40, height: 669};
// iOS NativeEventEmitter needs these two on the module, as RCTEventEmitter has.
const emitterMethods = {addListener: jest.fn(), removeListeners: jest.fn()};

describe('useFoldRegion', () => {
  const original = NativeModules.HolocronFold;
  let listener: ((region: unknown) => void) | undefined;
  let remove: jest.Mock;

  beforeEach(() => {
    listener = undefined;
    remove = jest.fn();
    jest
      .spyOn(NativeEventEmitter.prototype, 'addListener')
      .mockImplementation(((_event: string, callback: (region: unknown) => void) => {
        listener = callback;
        return {remove};
      }) as never);
  });

  afterEach(() => {
    NativeModules.HolocronFold = original;
    jest.restoreAllMocks();
  });

  it('is null without the native module', () => {
    NativeModules.HolocronFold = undefined;
    const {result} = renderHook(() => useFoldRegion());
    expect(result.current).toBeNull();
  });

  it('reads the current region, then follows holocronFoldChanged, including back to flat', async () => {
    NativeModules.HolocronFold = {...emitterMethods, getDivisionRegion: jest.fn().mockResolvedValue(crease)};
    const {result} = renderHook(() => useFoldRegion());
    await waitFor(() => expect(result.current).toEqual(crease));

    act(() => listener?.({x: 0, y: 455.5, width: 669, height: 40}));
    expect(result.current).toEqual({x: 0, y: 455.5, width: 669, height: 40});

    // The module sends null when the device is fully open or closed.
    act(() => listener?.(null));
    expect(result.current).toBeNull();
  });

  it('treats a null initial region as flat and stops listening on unmount', async () => {
    NativeModules.HolocronFold = {...emitterMethods, getDivisionRegion: jest.fn().mockResolvedValue(null)};
    const {result, unmount} = renderHook(() => useFoldRegion());
    await waitFor(() => expect(NativeModules.HolocronFold.getDivisionRegion).toHaveBeenCalled());
    expect(result.current).toBeNull();
    unmount();
    expect(remove).toHaveBeenCalled();
  });
});
