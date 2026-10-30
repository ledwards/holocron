import React, {useContext} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import usePaneFold from '../../lib/usePaneFold';
import {PaneReachesBottomContext} from '../../contexts/DeviceLayoutContext';
import {useFocusEffect} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import ThemeContext from '../../contexts/ThemeContext';
import {workspaceLayout} from '../../lib/adaptiveLayout';
import WorkspaceLayoutContext from '../../contexts/WorkspaceLayoutContext';
import PaneInsetsContext, {PaneInsets, usePaneInsets} from '../../contexts/PaneInsetsContext';

interface Props {
  browser: React.ReactNode | ((split: boolean) => React.ReactNode);
  detail: React.ReactNode;
  selected: boolean;
  onBack: () => void;
  title: string;
  topInset?: number;
  showBackButton?: boolean;
}

export default function AdaptiveWorkspace({
  browser,
  detail,
  selected,
  onBack,
  title,
  topInset = 0,
  showBackButton = true,
}: Props) {
  const theme = useContext(ThemeContext);
  const window = useWindowDimensions();
  // On iPhone Duo partly folded, the panes meet at the fold (side by side)
  // or stack around it (detail above), instead of straddling the crease.
  const pane = usePaneFold(topInset);
  const {split, browserWidth, stacked, detailHeight, gap} =
    workspaceLayout(pane.width, window.fontScale, pane.fold, pane.height);
  // Both panes run under the header (and the iPhone Duo strip) and pad their
  // content by these insets instead, so that chrome stays translucent. Stacked
  // around a horizontal fold, the workspace simply starts below the header.
  const strip = usePaneInsets();
  const sideBySide = split && !stacked;
  const top = stacked ? 0 : topInset;
  const browseInsets = React.useMemo<PaneInsets>(
    () => ({top, left: strip.left, right: sideBySide ? 0 : strip.right}),
    [top, strip.left, strip.right, sideBySide],
  );
  const detailInsets = React.useMemo<PaneInsets>(
    () => ({top, left: sideBySide ? 0 : strip.left, right: strip.right}),
    [top, strip.left, strip.right, sideBySide],
  );
  const backRow = !split && selected && showBackButton;
  // The Back row takes the top inset itself; the detail starts below it.
  const detailContentInsets = React.useMemo<PaneInsets>(
    () => (backRow ? {...detailInsets, top: 0} : detailInsets),
    [backRow, detailInsets],
  );
  // The search dock may grow over the detail pane while typing (up to the
  // strip, if any), but never across a fold.
  const workspaceLayoutValue = React.useMemo(
    () => ({dockExpansion: sideBySide && !gap ? Math.max(0, pane.width - browserWidth - strip.right) : 0}),
    [sideBySide, gap, pane.width, browserWidth, strip.right],
  );
  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (!selected || split) return false;
          onBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [selected, split, onBack]),
  );
  const browsePane = (
    <View
      key="browse"
      testID="browse-pane"
      accessibilityElementsHidden={!split && selected}
      importantForAccessibility={
        !split && selected ? 'no-hide-descendants' : 'auto'
      }
      style={{
        width: split && !stacked ? browserWidth : '100%',
        flex: stacked ? 1 : undefined,
        zIndex: 1,
        display: !split && selected ? 'none' : 'flex',
        borderRightWidth: split && !stacked && !gap ? StyleSheet.hairlineWidth : 0,
        borderColor: theme?.dividerColor,
      }}>
      <WorkspaceLayoutContext.Provider value={workspaceLayoutValue}>
        <PaneInsetsContext.Provider value={browseInsets}>
          {typeof browser === 'function' ? browser(split) : browser}
        </PaneInsetsContext.Provider>
      </WorkspaceLayoutContext.Provider>
    </View>
  );
  const foldGap = gap > 0 ? (
    <View
      key="fold"
      testID="fold-gap"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={stacked ? {height: gap} : {width: gap}}
    />
  ) : null;
  const detailPane = (
    <View
      key="detail"
      testID="detail-pane"
      style={{
        flex: stacked ? undefined : 1,
        height: stacked ? detailHeight : undefined,
        minWidth: 0,
        display: split || selected ? 'flex' : 'none',
      }}>
      {backRow && (
        <View style={{paddingTop: detailInsets.top, paddingLeft: detailInsets.left}}>
          <PaneIconButton
            testID="adaptive-back"
            label={`Back to ${title}`}
            icon="chevron-back"
            onPress={onBack}
          />
        </View>
      )}
      <PaneReachesBottomContext.Provider value={!stacked}>
        <PaneInsetsContext.Provider value={detailContentInsets}>
          {detail}
        </PaneInsetsContext.Provider>
      </PaneReachesBottomContext.Provider>
    </View>
  );
  return (
    <View
      testID="adaptive-workspace"
      ref={pane.ref}
      onLayout={pane.onLayout}
      style={{
        flex: 1,
        paddingTop: stacked ? topInset : 0,
        flexDirection: stacked ? 'column' : 'row',
        backgroundColor: theme?.backgroundColor,
      }}>
      {stacked ? [detailPane, foldGap, browsePane] : [browsePane, foldGap, detailPane]}
    </View>
  );
}

export function PaneButton({
  label,
  onPress,
  testID,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  selected?: boolean;
}) {
  const theme = useContext(ThemeContext);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={({pressed}) => ({
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
        backgroundColor: selected ? theme?.secondaryBackgroundColor : undefined,
        borderRadius: 8,
      })}>
      <Text
        style={{
          color: theme?.foregroundColor,
          fontSize: 16,
          fontWeight: '600',
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyDetail({label}: {label: string}) {
  const theme = useContext(ThemeContext);
  const insets = usePaneInsets();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        paddingTop: 32 + insets.top,
        paddingLeft: 32 + insets.left,
        paddingRight: 32 + insets.right,
      }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '600',
          textAlign: 'center',
          color: theme?.foregroundColor,
        }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 16,
          marginTop: 10,
          textAlign: 'center',
          color: theme?.foregroundColor,
        }}>
        Choose a result to view its details.
      </Text>
    </View>
  );
}

export function PaneIconButton({label, icon, testID, onPress}: {
  label: string; icon: string; testID?: string; onPress: () => void;
}) {
  const theme = useContext(ThemeContext);
  return <Pressable testID={testID} accessibilityLabel={label} accessibilityRole="button"
    onPress={onPress} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
    <Icon name={icon} type="ionicon" size={24} color={theme?.foregroundColor} />
  </Pressable>;
}
