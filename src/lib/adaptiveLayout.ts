/** All sizes are in points in the available pane, never the physical display. */
export function workspaceLayout(width: number, fontScale = 1) {
  const minimumBrowser = 280 * Math.min(Math.max(fontScale, 1), 1.5);
  const split = width >= minimumBrowser + 340;
  return {
    split,
    browserWidth: split
      ? Math.min(Math.max(width * 0.32, minimumBrowser), 380)
      : width,
  };
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
