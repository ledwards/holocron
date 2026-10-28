/**
 * Layout decisions for iPhone Duo (and anything shaped like it), from what the
 * system reports rather than from device names. See
 * docs/plans/iphone-duo-controls-and-fold-plan.md.
 */

export type ControlPlacement = 'bottom' | 'left' | 'right';

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A reserved region in window points, e.g. the fold of a partly folded display. */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Insets on the two sides that differ by less than this are symmetric. */
const SYMMETRY_TOLERANCE = 16;

/**
 * Where the tab bar and screen actions go.
 *
 * iPhone Duo moves the status bar and Dynamic Island into a vertical strip on
 * one edge, and asks apps to put their bars there too. The window then has a
 * large inset on ONE side and little at the top. A regular iPhone in landscape
 * has equal insets on both sides (the camera can be on either), and keeps its
 * bars at the bottom, so symmetry decides.
 */
export function controlPlacement(insets: EdgeInsets): ControlPlacement {
  const side = Math.max(insets.left, insets.right);
  const asymmetric = Math.abs(insets.left - insets.right) >= SYMMETRY_TOLERANCE;
  if (!asymmetric || side <= insets.top) {
    return 'bottom';
  }
  return insets.right > insets.left ? 'right' : 'left';
}

/** Width of the vertical control strip: at least the system's own strip. */
export function railWidth(insets: EdgeInsets, placement: ControlPlacement): number {
  if (placement === 'bottom') {
    return 0;
  }
  return Math.max(64, placement === 'right' ? insets.right : insets.left);
}

/** A fold expressed in a pane's own coordinates. */
export interface PaneFold {
  axis: 'vertical' | 'horizontal';
  /** distance from the pane's leading (vertical) or top (horizontal) edge */
  start: number;
  /** width (vertical) or height (horizontal) of the region to keep clear */
  size: number;
}

/**
 * The part of a window-space fold region that crosses a pane, or null when the
 * fold is flat (zero size) or misses the pane.
 */
export function foldInPane(fold: Region | null | undefined, pane: Region): PaneFold | null {
  if (!fold || fold.width <= 0 || fold.height <= 0) {
    return null;
  }
  const vertical = fold.height >= fold.width;
  if (vertical) {
    const start = fold.x - pane.x;
    if (start <= 0 || start + fold.width >= pane.width) {
      return null;
    }
    return {axis: 'vertical', start, size: fold.width};
  }
  const start = fold.y - pane.y;
  if (start <= 0 || start + fold.height >= pane.height) {
    return null;
  }
  return {axis: 'horizontal', start, size: fold.height};
}
