import {createContext} from 'react';
import {ControlPlacement, Region} from '../lib/duoLayout';

/**
 * How the system has shaped the window: where controls go (bottom bar, or a
 * vertical strip on iPhone Duo), how wide that strip is, the bottom safe-area
 * inset, and any fold crossing the display. Provided by TabNavigation; the
 * default is a regular iPhone with nothing folded.
 */
export interface DeviceLayout {
  placement: ControlPlacement;
  railWidth: number;
  bottomInset: number;
  fold: Region | null;
}

export const defaultDeviceLayout: DeviceLayout = {
  placement: 'bottom',
  railWidth: 0,
  bottomInset: 0,
  fold: null,
};

const DeviceLayoutContext = createContext<DeviceLayout>(defaultDeviceLayout);
export default DeviceLayoutContext;
