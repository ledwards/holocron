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
        display: !split && selected ? 'none' : 'flex',
        borderRightWidth: split && !stacked && !gap ? StyleSheet.hairlineWidth : 0,
        borderColor: theme?.dividerColor,
      }}>
      {typeof browser === 'function' ? browser(split) : browser}
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
      {!split && selected && showBackButton && (
        <PaneIconButton
          testID="adaptive-back"
          label={`Back to ${title}`}
          icon="chevron-back"
          onPress={onBack}
        />
      )}
      <PaneReachesBottomContext.Provider value={!stacked}>
        {detail}
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
        paddingTop: topInset,
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
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
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
