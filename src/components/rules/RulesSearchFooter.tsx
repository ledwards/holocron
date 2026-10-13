import React, {useContext} from 'react';
import {View, Text, Pressable} from 'react-native';
import {Icon} from 'react-native-elements';
import ThemeContext from '../../contexts/ThemeContext';
import {PaneIconButton} from '../adaptive/AdaptiveWorkspace';

interface Props {
  query: string;
  hitProgressLabel: string;
  onOpenSearch: () => void;
  onPrevHit: () => void;
  onNextHit: () => void;
}

export default function RulesSearchFooter(props: Props) {
  const theme = useContext(ThemeContext);
  const color = theme?.foregroundColor || '#111111';
  return (
    <View
      testID="rules-match-bar"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        borderTopWidth: 0.5,
        borderColor: theme?.dividerColor,
        paddingHorizontal: 8,
      }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit rules search"
        onPress={props.onOpenSearch}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}>
        <Icon name="search-outline" type="ionicon" size={22} color={color} />
        <Text
          numberOfLines={1}
          style={{flex: 1, marginLeft: 8, fontSize: 16, color}}>
          {props.query}
        </Text>
      </Pressable>
      <Text
        testID="rules-hit-progress"
        style={{fontSize: 12, color, opacity: 0.65}}>
        {props.hitProgressLabel}
      </Text>
      <PaneIconButton
        testID="rules-prev-hit"
        label="Previous matching page"
        icon="chevron-up"
        onPress={props.onPrevHit}
      />
      <PaneIconButton
        testID="rules-next-hit"
        label="Next matching page"
        icon="chevron-down"
        onPress={props.onNextHit}
      />
    </View>
  );
}
