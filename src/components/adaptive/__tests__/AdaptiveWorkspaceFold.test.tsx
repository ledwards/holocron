import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import AdaptiveWorkspace from '../AdaptiveWorkspace';
import DeviceLayoutContext, {defaultDeviceLayout} from '../../../contexts/DeviceLayoutContext';
import {Region} from '../../../lib/duoLayout';
import useBottomClearance from '../../../lib/useBottomClearance';

jest.mock('@react-navigation/bottom-tabs', () => ({useBottomTabBarHeight: () => 62}));

function Clearance({testID}: {testID: string}) {
  return <Text testID={testID}>{String(useBottomClearance(58))}</Text>;
}

jest.mock('@react-navigation/native', () => ({useFocusEffect: jest.fn()}));
jest.mock('react-native-elements', () => ({Icon: () => null}));

const renderWorkspace = (fold: Region | null, width: number, height: number) => {
  const screen = render(
    <DeviceLayoutContext.Provider value={{...defaultDeviceLayout, fold}}>
      <AdaptiveWorkspace title="Cards" selected={true} onBack={jest.fn()}
        browser={<Clearance testID="browser-clearance" />} detail={<Clearance testID="detail-clearance" />} />
    </DeviceLayoutContext.Provider>,
  );
  fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
  return screen;
};
const style = (node: {props: {style: unknown}}) => Object.assign({}, ...[node.props.style].flat());

describe('AdaptiveWorkspace on a partly folded display', () => {
  it('lays out as before when the display is flat', () => {
    const screen = renderWorkspace(null, 826, 626);
    expect(style(screen.getByTestId('browse-pane')).width).toBe(280);
    expect(screen.queryByTestId('fold-gap', {includeHiddenElements: true})).toBeNull();
  });

  it('ends the browser at a vertical fold and keeps the fold empty', () => {
    const screen = renderWorkspace({x: 433, y: 0, width: 24, height: 626}, 826, 626);
    expect(style(screen.getByTestId('browse-pane')).width).toBe(433);
    expect(style(screen.getByTestId('fold-gap', {includeHiddenElements: true})).width).toBe(24);
    expect(style(screen.getByTestId('adaptive-workspace')).flexDirection).toBe('row');
  });

  it('stacks the detail above a horizontal fold and the browser below it', () => {
    const screen = renderWorkspace({x: 0, y: 433, width: 626, height: 24}, 626, 828);
    const workspace = screen.getByTestId('adaptive-workspace');
    expect(style(workspace).flexDirection).toBe('column');
    expect(style(screen.getByTestId('detail-pane')).height).toBe(433);
    expect(style(screen.getByTestId('fold-gap', {includeHiddenElements: true})).height).toBe(24);
    const order = workspace.props.children.map((child: {key: string}) => child.key);
    expect(order).toEqual(['detail', 'fold', 'browse']);
  });

  it('reserves no tab bar space in a detail pane that ends at the fold', () => {
    // found in a web render: the card art above the fold shrank to leave room
    // for a tab bar that is below the fold, not below the pane
    const screen = renderWorkspace({x: 0, y: 433, width: 626, height: 24}, 626, 828);
    expect(screen.getByTestId('detail-clearance').props.children).toBe('0');
    expect(screen.getByTestId('browser-clearance').props.children).toBe('62');
  });

  it('keeps tab bar space in both panes when side by side', () => {
    const screen = renderWorkspace({x: 433, y: 0, width: 24, height: 626}, 826, 626);
    expect(screen.getByTestId('detail-clearance').props.children).toBe('62');
  });

  it('shows both panes when stacked, even on a compact width', () => {
    const screen = renderWorkspace({x: 0, y: 433, width: 600, height: 24}, 600, 828);
    expect(style(screen.getByTestId('browse-pane')).display).toBe('flex');
    expect(style(screen.getByTestId('detail-pane')).display).toBe('flex');
  });
});
