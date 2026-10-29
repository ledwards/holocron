import React from 'react';
import {Text} from 'react-native';
import {render} from '@testing-library/react-native';
import GlassSurface from '../GlassSurface';
import ThemeContext from '../../../contexts/ThemeContext';

const flat = (node: {props: {style: unknown}}) => Object.assign({}, ...[node.props.style].flat());
const theme = (name: 'dark' | 'light') => ({
  name, backgroundColor: '#000', foregroundColor: '#fff', dividerColor: '#444', translucentBackgroundColor: 'rgba(0,0,0,.5)',
}) as never;

describe('GlassSurface', () => {
  it('shows its children and puts the highlight only on the requested edge', () => {
    const screen = render(
      <GlassSurface testID="glass" edge="top"><Text>inside</Text></GlassSurface>,
    );
    expect(screen.getByText('inside')).toBeTruthy();
    const style = flat(screen.getByTestId('glass'));
    expect(style.borderTopWidth).toBeGreaterThan(0);
    expect(style.borderBottomWidth).toBe(0);
    expect(style.overflow).toBe('hidden');
  });

  it('rounds all corners as a capsule and outlines it on every side', () => {
    const screen = render(<GlassSurface testID="glass" edge="all" radius={24} />);
    const style = flat(screen.getByTestId('glass'));
    expect(style.borderRadius).toBe(24);
    expect(style.borderLeftWidth).toBeGreaterThan(0);
  });

  it('uses a darker highlight on light themes so the edge stays visible', () => {
    const dark = flat(render(
      <ThemeContext.Provider value={theme('dark')}><GlassSurface testID="g" edge="all" /></ThemeContext.Provider>,
    ).getByTestId('g'));
    const light = flat(render(
      <ThemeContext.Provider value={theme('light')}><GlassSurface testID="g" edge="all" /></ThemeContext.Provider>,
    ).getByTestId('g'));
    expect(dark.borderColor).not.toBe(light.borderColor);
  });
});
