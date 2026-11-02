import {PaneFold} from './duoLayout';

/** Smallest height for each region when panes stack around a horizontal fold. */
const MINIMUM_STACKED_REGION = 200;

/**
 * All sizes are in points in the available pane, never the physical display.
 *
 * Side by side, fully open, the list takes a third of the width (at least
 * enough for its search hint on one line) and the detail the rest. Half-open,
 * the fold sets the split instead: one pane on each screen, half and half.
 *
 * With a fold crossing the pane (iPhone Duo partly folded), the panes meet at
 * the fold instead of straddling it: a vertical fold sets the browser width,
 * a horizontal one stacks the detail above the browser. `gap` is the fold's
 * size, kept empty. A fold that leaves either side too small is ignored.
 */
export function workspaceLayout(width: number, fontScale = 1, fold?: PaneFold | null, height = 0) {
  const minimumBrowser = 280 * Math.min(Math.max(fontScale, 1), 1.5);
  // Wide enough for the search hint ("Tap the icon to switch between search
  // modes.") to stay on one line; a third of the display is narrower on iPhone Duo.
  const listWidth = 360 * Math.min(Math.max(fontScale, 1), 1.5);
  const split = width >= minimumBrowser + 340;
  const regular = {
    split,
    browserWidth: split ? Math.max(Math.round(width / 3), listWidth) : width,
    stacked: false,
    detailHeight: 0,
    gap: 0,
  };

  if (fold?.axis === 'vertical') {
    const detailWidth = width - fold.start - fold.size;
    if (fold.start >= minimumBrowser && detailWidth >= 280) {
      return {...regular, split: true, browserWidth: fold.start, gap: fold.size};
    }
  }

  if (fold?.axis === 'horizontal') {
    const below = height - fold.start - fold.size;
    if (fold.start >= MINIMUM_STACKED_REGION && below >= MINIMUM_STACKED_REGION) {
      return {...regular, split: true, stacked: true, browserWidth: width, detailHeight: fold.start, gap: fold.size};
    }
  }

  return regular;
}

export function fitArtwork(
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
  sideways: boolean,
) {
  const rotate = sideways && sourceHeight > sourceWidth;
  const intrinsicWidth = rotate ? sourceHeight : sourceWidth;
  const intrinsicHeight = rotate ? sourceWidth : sourceHeight;
  const scale = Math.max(
    0,
    Math.min(width / intrinsicWidth, height / intrinsicHeight),
  );
  const frameWidth = intrinsicWidth * scale;
  const frameHeight = intrinsicHeight * scale;
  return {
    frameWidth,
    frameHeight,
    rotate,
    imageWidth: rotate ? frameHeight : frameWidth,
    imageHeight: rotate ? frameWidth : frameHeight,
  };
}
