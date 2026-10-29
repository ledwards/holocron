import React, {useContext} from 'react';
import {View, TextInput, Pressable, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import ThemeContext from '../../contexts/ThemeContext';

interface Props {
  testID: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  icon?: string;
  onModePress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/** A normal-flow input: no animated wrapper or fixed device-size assumptions. */
export default function SearchField({testID, value, placeholder, onChangeText,
  icon = 'search-outline', onModePress, onFocus, onBlur}: Props) {
  const theme = useContext(ThemeContext);
  const color = theme?.foregroundColor || '#111111';
  return (
    <View style={[styles.row, {backgroundColor: theme?.secondaryBackgroundColor || '#eeeeee'}]}>
      {onModePress ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Change search mode"
          testID="cards-search-mode-toggle" onPress={onModePress} style={styles.button}>
          <Icon name={icon} type="ionicon" color={color} size={22} />
        </Pressable>
      ) : <View style={styles.button}><Icon name={icon} type="ionicon" color={color} size={22} /></View>}
      <TextInput testID={testID} accessibilityLabel={placeholder} placeholder={placeholder}
        placeholderTextColor={theme?.iconColor || '#666666'} value={value}
        onChangeText={onChangeText} autoCorrect={false} returnKeyType="search"
        onFocus={onFocus} onBlur={onBlur}
        style={[styles.input, {color}]} />
      {!!value && <Pressable accessibilityRole="button" accessibilityLabel="Clear search"
        testID={`${testID}-clear`} onPress={() => onChangeText('')} style={styles.button}>
        <Icon name="close-outline" type="ionicon" color={color} size={22} />
      </Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', borderRadius: 24, minHeight: 48, marginBottom: 8},
  button: {width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center'},
  input: {flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 10, paddingRight: 12, fontSize: 17},
});
