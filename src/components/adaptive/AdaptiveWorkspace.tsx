import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
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
  const [width, setWidth] = useState(window.width);
  const {split, browserWidth} = workspaceLayout(width, window.fontScale);
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
  return (
    <View
      testID="adaptive-workspace"
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{
        flex: 1,
        paddingTop: topInset,
        flexDirection: 'row',
        backgroundColor: theme?.backgroundColor,
      }}>
      <View
        testID="browse-pane"
        accessibilityElementsHidden={!split && selected}
        importantForAccessibility={
          !split && selected ? 'no-hide-descendants' : 'auto'
        }
        style={{
          width: split ? browserWidth : '100%',
          display: !split && selected ? 'none' : 'flex',
          borderRightWidth: split ? StyleSheet.hairlineWidth : 0,
          borderColor: theme?.dividerColor,
        }}>
        {typeof browser === 'function' ? browser(split) : browser}
      </View>
      <View
        testID="detail-pane"
        style={{
          flex: 1,
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
        {detail}
      </View>
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
