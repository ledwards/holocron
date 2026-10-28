import {controlPlacement, foldInPane, railWidth} from '../duoLayout';

const insets = (top: number, right: number, bottom: number, left: number) => ({top, right, bottom, left});

describe('controlPlacement', () => {
  it.each([
    ['iPhone portrait', insets(62, 0, 34, 0), 'bottom'],
    ['iPhone landscape (camera left)', insets(0, 62, 21, 62), 'bottom'],
    ['iPhone landscape, home indicator only', insets(0, 59, 21, 59), 'bottom'],
    ['iPad', insets(24, 0, 20, 0), 'bottom'],
    ['no insets (web, tests)', insets(0, 0, 0, 0), 'bottom'],
    ['iPhone Duo closed: system strip on the trailing edge', insets(0, 54, 20, 0), 'right'],
    ['iPhone Duo open in landscape', insets(0, 54, 20, 0), 'right'],
    ['iPhone Duo open upright: status bar at the top', insets(32, 0, 20, 0), 'bottom'],
    ['iPhone Duo Split View, left app', insets(0, 0, 20, 54), 'left'],
  ] as const)('%s → %s', (_name, value, expected) => {
    expect(controlPlacement(value)).toBe(expected);
  });
});

describe('railWidth', () => {
  it('is at least the system strip and never less than 64', () => {
    expect(railWidth(insets(0, 54, 20, 0), 'right')).toBe(64);
    expect(railWidth(insets(0, 80, 20, 0), 'right')).toBe(80);
    expect(railWidth(insets(0, 0, 20, 72), 'left')).toBe(72);
    expect(railWidth(insets(62, 0, 34, 0), 'bottom')).toBe(0);
  });
});

describe('foldInPane', () => {
  const pane = {x: 0, y: 0, width: 826, height: 626};

  it('maps a vertical fold into the pane', () => {
    expect(foldInPane({x: 433, y: 0, width: 24, height: 626}, pane)).toEqual({axis: 'vertical', start: 433, size: 24});
  });

  it('subtracts the pane origin', () => {
    expect(foldInPane({x: 433, y: 0, width: 24, height: 626}, {...pane, x: 64})).toEqual({axis: 'vertical', start: 369, size: 24});
  });

  it('maps a horizontal fold (propped on a table)', () => {
    expect(foldInPane({x: 0, y: 433, width: 626, height: 24}, {x: 0, y: 0, width: 626, height: 828}))
      .toEqual({axis: 'horizontal', start: 433, size: 24});
  });

  it('ignores a flat fold and a fold outside the pane', () => {
    expect(foldInPane(null, pane)).toBeNull();
    expect(foldInPane({x: 433, y: 0, width: 0, height: 626}, pane)).toBeNull();
    expect(foldInPane({x: 900, y: 0, width: 24, height: 626}, pane)).toBeNull();
  });
});

describe('workspaceLayout with a fold', () => {
  const {workspaceLayout} = require('../adaptiveLayout');

  it('without a fold behaves exactly as before', () => {
    expect(workspaceLayout(826)).toEqual({split: true, browserWidth: 280, stacked: false, detailHeight: 0, gap: 0});
    expect(workspaceLayout(466)).toEqual({split: false, browserWidth: 466, stacked: false, detailHeight: 0, gap: 0});
  });

  it('meets a vertical fold: the browser ends where the fold starts', () => {
    expect(workspaceLayout(826, 1, {axis: 'vertical', start: 433, size: 24}))
      .toEqual({split: true, browserWidth: 433, stacked: false, detailHeight: 0, gap: 24});
  });

  it('ignores a vertical fold that would leave a side too narrow', () => {
    expect(workspaceLayout(826, 1, {axis: 'vertical', start: 200, size: 24}).browserWidth).toBe(280);
    expect(workspaceLayout(826, 1, {axis: 'vertical', start: 600, size: 24}).browserWidth).toBe(280);
  });

  it('stacks around a horizontal fold, detail above', () => {
    expect(workspaceLayout(626, 1, {axis: 'horizontal', start: 433, size: 24}, 828))
      .toEqual({split: true, browserWidth: 626, stacked: true, detailHeight: 433, gap: 24});
  });

  it('ignores a horizontal fold too close to an edge', () => {
    expect(workspaceLayout(626, 1, {axis: 'horizontal', start: 120, size: 24}, 828).stacked).toBe(false);
  });
});
