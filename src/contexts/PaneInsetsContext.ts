import {createContext, useContext} from 'react';

/**
 * Room the app's glass chrome takes over a pane: the header above it and, on
 * iPhone Duo, the vertical control strip beside it. Panes run full-bleed under
 * that chrome so the glass has content to blur; scrolling content pads by these
 * insets (and scrolls beneath), while text and controls stay inside them.
 */
export interface PaneInsets {
  top: number;
  left: number;
  right: number;
}

export const noPaneInsets: PaneInsets = {top: 0, left: 0, right: 0};

const PaneInsetsContext = createContext<PaneInsets>(noPaneInsets);
export default PaneInsetsContext;

export function usePaneInsets(): PaneInsets {
  return useContext(PaneInsetsContext);
}
