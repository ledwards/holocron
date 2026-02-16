const {computeCropRect, anchorOffsets} = require('../../../scripts/screenshots/lib/crop');

describe('screenshot crop math', () => {
  it('computes centered crop offsets', () => {
    const rect = computeCropRect(
      {width: 1300, height: 2800},
      {width: 1284, height: 2778},
      'center',
    );

    expect(rect).toEqual({
      width: 1284,
      height: 2778,
      x: 8,
      y: 11,
    });
  });

  it('computes top-left anchor offsets', () => {
    const offset = anchorOffsets('top-left', {width: 100, height: 100}, {width: 80, height: 70});
    expect(offset).toEqual({x: 0, y: 0});
  });

  it('throws when source is smaller than target', () => {
    expect(() =>
      computeCropRect({width: 100, height: 100}, {width: 120, height: 80}, 'center'),
    ).toThrow('Source image too small for crop');
  });
});
