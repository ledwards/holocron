import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import AdaptiveWorkspace from '../AdaptiveWorkspace';
import DeviceLayoutContext, {defaultDeviceLayout} from '../../../contexts/DeviceLayoutContext';
import {Region} from '../../../lib/duoLayout';
import useBottomClearance from '../../../lib/useBottomClearance';
import WorkspaceLayoutContext from '../../../contexts/WorkspaceLayoutContext';
import PaneInsetsContext, {PaneInsets, usePaneInsets} from '../../../contexts/PaneInsetsContext';

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
  it('splits evenly when the display is flat', () => {
    const screen = renderWorkspace(null, 826, 626);
    expect(style(screen.getByTestId('browse-pane')).width).toBe(413);
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

describe('where the search dock may grow while typing', () => {
  const Expansion = () => {
    const {dockExpansion} = React.useContext(WorkspaceLayoutContext);
    return <Text testID="dock-expansion">{String(dockExpansion)}</Text>;
  };
  const expansion = (fold: Region | null, width: number, height: number) => {
    const screen = render(
      <DeviceLayoutContext.Provider value={{...defaultDeviceLayout, fold}}>
        <AdaptiveWorkspace title="Cards" selected={false} onBack={jest.fn()}
          browser={<Expansion />} detail={<Text>detail</Text>} />
      </DeviceLayoutContext.Provider>,
    );
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
    return Number(screen.getByTestId('dock-expansion').props.children);
  };

  it('spans the detail pane when the panes sit side by side', () => {
    expect(expansion(null, 826, 626)).toBe(826 - 413);
  });

  it('stops at the iPhone Duo strip floating over the detail pane', () => {
    const screen = render(
      <PaneInsetsContext.Provider value={{top: 0, left: 0, right: 84}}>
        <AdaptiveWorkspace title="Cards" selected={false} onBack={jest.fn()}
          browser={<Expansion />} detail={<Text>detail</Text>} />
      </PaneInsetsContext.Provider>,
    );
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width: 951, height: 669}}});
    expect(Number(screen.getByTestId('dock-expansion').props.children)).toBe(951 - 476 - 84);
  });

  it('stays in its pane on a compact width, where it is already full width', () => {
    expect(expansion(null, 466, 678)).toBe(0);
  });

  it('never crosses a fold, vertical or horizontal', () => {
    expect(expansion({x: 433, y: 0, width: 24, height: 626}, 826, 626)).toBe(0);
    expect(expansion({x: 0, y: 433, width: 626, height: 24}, 626, 828)).toBe(0);
  });
});

describe('panes run under the glass header and strip', () => {
  const Insets = ({testID}: {testID: string}) => <Text testID={testID}>{JSON.stringify(usePaneInsets())}</Text>;
  const renderWith = (strip: PaneInsets, width: number, selected = false, fold: Region | null = null, height = 669) => {
    const screen = render(
      <DeviceLayoutContext.Provider value={{...defaultDeviceLayout, fold}}>
        <PaneInsetsContext.Provider value={strip}>
          <AdaptiveWorkspace title="Cards" topInset={103} selected={selected} onBack={jest.fn()}
            browser={<Insets testID="browse-insets" />} detail={<Insets testID="detail-insets" />} />
        </PaneInsetsContext.Provider>
      </DeviceLayoutContext.Provider>,
    );
    fireEvent(screen.getByTestId('adaptive-workspace'), 'layout', {nativeEvent: {layout: {x: 0, y: 0, width, height}}});
    const read = (id: string) => JSON.parse(screen.getByTestId(id, {includeHiddenElements: true}).props.children);
    return {screen, browse: read('browse-insets'), detail: read('detail-insets')};
  };

  it('does not pad the workspace below the header; each pane insets its own content', () => {
    const {screen, browse, detail} = renderWith({top: 0, left: 0, right: 0}, 826);
    expect(style(screen.getByTestId('adaptive-workspace')).paddingTop).toBe(0);
    expect(browse.top).toBe(103);
    expect(detail.top).toBe(103);
  });

  it('gives the strip inset only to the pane under the strip', () => {
    const right = renderWith({top: 0, left: 0, right: 84}, 951);
    expect(right.browse).toEqual({top: 103, left: 0, right: 0});
    expect(right.detail).toEqual({top: 103, left: 0, right: 84});
    const left = renderWith({top: 0, left: 84, right: 0}, 951);
    expect(left.browse).toEqual({top: 103, left: 84, right: 0});
    expect(left.detail).toEqual({top: 103, left: 0, right: 0});
  });

  it('gives a full-width compact pane both strip edges', () => {
    expect(renderWith({top: 0, left: 0, right: 84}, 466).browse).toEqual({top: 103, left: 0, right: 84});
  });

  it('lets the compact Back row take the top inset', () => {
    const {detail} = renderWith({top: 0, left: 0, right: 84}, 466, true);
    expect(detail).toEqual({top: 0, left: 0, right: 84});
  });

  it('starts below the header when stacked around a horizontal fold', () => {
    const {screen, browse} = renderWith({top: 0, left: 0, right: 0}, 669, false, {x: 0, y: 455.5, width: 669, height: 40}, 951);
    expect(style(screen.getByTestId('adaptive-workspace')).paddingTop).toBe(103);
    expect(browse.top).toBe(0);
  });
});
