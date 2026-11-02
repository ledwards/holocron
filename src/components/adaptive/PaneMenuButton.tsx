import React, {useContext, useRef, useState} from 'react';
import {Modal, Pressable, Text, View, useWindowDimensions} from 'react-native';
import {Icon} from 'react-native-elements';
import ThemeContext from '../../contexts/ThemeContext';
import {PaneIconButton} from './AdaptiveWorkspace';

export interface PaneMenuOption<T extends string> {
  value: T;
  label: string;
  icon: string;
}

interface Props<T extends string> {
  testID?: string;
  label: string;
  icon: string;
  options: PaneMenuOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/**
 * An icon button that opens a small menu of exclusive choices, the chosen one
 * checkmarked. The menu opens beside the button, on whichever side has room,
 * so it works in iPhone Duo's vertical strip as well as in a header.
 */
export default function PaneMenuButton<T extends string>({testID, label, icon, options, selected, onSelect}: Props<T>) {
  const theme = useContext(ThemeContext);
  const window = useWindowDimensions();
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<{x: number; y: number; width: number; height: number} | null>(null);
  const [open, setOpen] = useState(false);
  const color = theme?.foregroundColor || '#FFFFFF';

  const show = () => {
    setOpen(true);
    ref.current?.measureInWindow?.((x, y, width, height) => setAnchor({x, y, width, height}));
  };
  const toRight = anchor ? anchor.x + anchor.width / 2 < window.width / 2 : false;
  const position = anchor
    ? {
        top: Math.max(8, anchor.y),
        ...(toRight ? {left: anchor.x + anchor.width + 8} : {right: window.width - anchor.x + 8}),
      }
    : {top: 60, right: 12};

  return (
    <View ref={ref} collapsable={false}>
      <PaneIconButton testID={testID} label={label} icon={icon} onPress={show} />
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          accessibilityLabel="Close menu"
          style={{flex: 1}}
          onPress={() => setOpen(false)}>
          <View
            accessibilityRole="menu"
            style={{
              position: 'absolute',
              ...position,
              minWidth: 180,
              borderRadius: 14,
              paddingVertical: 4,
              backgroundColor: theme?.backgroundColor,
              borderWidth: 1,
              borderColor: theme?.dividerColor,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: {width: 0, height: 4},
            }}>
            {options.map(option => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  testID={testID ? `${testID}-${option.value}` : undefined}
                  accessibilityRole="menuitem"
                  accessibilityState={{checked: isSelected}}
                  onPress={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                  style={{minHeight: 44, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{width: 24}}>
                    {isSelected && <Icon name="checkmark" type="ionicon" size={20} color={color} />}
                  </View>
                  <Icon name={option.icon} type="ionicon" size={20} color={color} />
                  <Text style={{marginLeft: 10, fontSize: 16, color}}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
