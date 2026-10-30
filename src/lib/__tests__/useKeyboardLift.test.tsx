import React from 'react';
import {Animated, Keyboard, Platform, View} from 'react-native';
import {act, render} from '@testing-library/react-native';
import useKeyboardLift, {KEYBOARD_GAP, keyboardLift} from '../useKeyboardLift';

describe('keyboardLift', () => {
  it('raises the glass to sit just above the keyboard, letting the clearance slide under', () => {
    // Dock bottom at the window's bottom (844), keyboard top at 508, 85pt clearance.
    expect(keyboardLift(844, 508, 844, 85)).toBe(844 - 508 - 85 + KEYBOARD_GAP);
  });

  it('never lowers the dock or lifts for an offscreen keyboard', () => {
    expect(keyboardLift(400, 508, 844, 85)).toBe(0);
    expect(keyboardLift(844, 844, 844, 85)).toBe(0);
    expect(keyboardLift(844, 900, 844, 85)).toBe(0);
  });
});

describe('useKeyboardLift', () => {
  const listeners: Record<string, (event: any) => void> = {};
  let remove: jest.Mock;
  let lift: ReturnType<typeof useKeyboardLift>;

  function Dock({active = true}: {active?: boolean}) {
    lift = useKeyboardLift(85, active);
    return <View ref={lift.ref} />;
  }

  beforeEach(() => {
    Platform.OS = 'ios';
    remove = jest.fn();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((name: string, handler: any) => {
      listeners[name] = handler;
      return {remove} as any;
    }) as any);
    jest.spyOn(Animated, 'timing').mockImplementation(((value: Animated.Value, config: any) => ({
      start: () => value.setValue(config.toValue),
    })) as any);
  });

  afterEach(() => jest.restoreAllMocks());

  const value = () => (lift.translateY as any).__getValue();

  it('lifts from the measured dock position and drops back to zero on hide', () => {
    const screen = render(<Dock />);
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 508}, duration: 250}));
    expect(value()).toBe(-(844 - 508 - 85 + KEYBOARD_GAP));

    act(() => listeners.keyboardWillHide({duration: 250}));
    expect(value()).toBe(0);
    screen.unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it('measures the unlifted position when the keyboard moves while raised', () => {
    render(<Dock />);
    const raised = 844 - 508 - 85 + KEYBOARD_GAP;
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 508}, duration: 0}));
    // Now on screen it reads `raised` points higher; the lift must not compound.
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700 - raised, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 508}, duration: 0}));
    expect(value()).toBe(-raised);
  });

  it('resets when the keyboard frame ends offscreen', () => {
    render(<Dock />);
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 508}, duration: 0}));
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 2000}, duration: 0}));
    expect(value()).toBe(0);
  });

  it('ignores keyboard frames while its field is not focused (iPhone Duo opening)', () => {
    // Opening the phone sent a frame change with no visible keyboard and threw
    // the unfocused decklist dock to the top of the screen.
    render(<Dock active={false} />);
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 93}, duration: 0}));
    expect(value()).toBe(0);
  });

  it('drops the dock when its field loses focus', () => {
    const screen = render(<Dock />);
    lift.ref.current!.measureInWindow = (callback: any) => callback(0, 700, 390, 144);
    act(() => listeners.keyboardWillChangeFrame({endCoordinates: {screenY: 508}, duration: 0}));
    expect(value()).toBeLessThan(0);
    screen.rerender(<Dock active={false} />);
    expect(value()).toBe(0);
  });
});
